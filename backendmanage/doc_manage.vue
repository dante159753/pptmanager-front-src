<template>
  <div v-loading.body="page_loading">
    <el-select placeholder="按课程筛选" id='course-filter' @change='filter_by_course' v-model="selected_course">
      <el-option v-for="course in courses" :key="course.value" :label="course.name" :value="course.id">
      </el-option>
    </el-select>
    <el-row>
      <el-col :span="17">
        <div class="grid-content bg-purple-dark">
          <el-table :data="tableData">
            <el-table-column prop="id" label="编号">
            </el-table-column>
            <el-table-column prop="description" label="文档名">
            </el-table-column>
            <el-table-column prop="coursename" label="所属课程">
            </el-table-column>
            <el-table-column label="操作">
              <template scope="scope">
                <el-button @click="download(scope.row.id)" type="text" size="small">下载</el-button>
                <el-button @click="edit_course(scope.row.id)" type="text" size="small">编辑</el-button>
                <el-button @click="confirm_delete(scope.row.id)" type="text" size="small">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
    <el-row>
      <el-col id="upload_box">
        <h3>上传文件</h3>
        <div class="grid-content">
          <el-upload class="upload-demo" :action='upload_url' :on-remove="handleRemove" :file-list="fileList" :on-success='upload_success' :on-error='upload_error'>
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </div>
      </el-col>
    </el-row>
    <el-dialog title="编辑所属课程" :visible.sync="modifyBelongCourseVisible">
      <el-select placeholder="按课程筛选" v-model="modified_course">
        <el-option v-for="course in modify_courses" :key="course.value" :label="course.name" :value="course.id">
        </el-option>
      </el-select>
      <el-button type="primary" style="margin-left: 10px" @click="confirmSelect">确认修改</el-button>
    </el-dialog>
  </div>
</template>
<script>
import * as util from '../lib/app/util.js'

export default {
  data() {
      return {
        tableData: [],
        fileList: [],
        courses: [{
          id: null,
          name: '所有'
        }, {
          id: 0,
          name: '无所属课程'
        }],
        modify_courses: [{
          id: 0,
          name: '无所属课程'
        }],
        selected_course: null,
        page_loading: true,
        modifyBelongCourseVisible: false,
        modified_course: null,
        modified_doc_id: '',
        upload_url: util.urlprefix() + '/document'
      };
    },
    methods: {
      handleRemove(file, fileList) {
        console.log(file, fileList);
      },
      download(doc_id) {
        window.open(util.urlprefix() + '/docfile/' + doc_id, '_blank');
      },
      upload_success(response, file, fileList) {
        this.$message({
          type: 'success',
          message: '上传成功'
        });
        this.get_documents(this.selected_course);
      },
      upload_error(err, file, fileList) {
        this.$message({
          type: 'info',
          message: '上传失败，格式是否符合要求？'
        });
      },
      confirm_delete(doc_id) {
        this.$confirm('将永久删除, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http.delete(
            util.urlprefix() + '/document/' + doc_id, {
              headers: {
                token: util.get_userinfo().token
              }
            }
          ).then(response => {
            console.log(response.body);
            if (response.body['code'] == '200') {
              this.$message({
                type: 'success',
                message: '删除成功'
              });

              this.get_documents(this.selected_course);
            } else {
              this.$message({
                type: 'info',
                message: '验证失败'
              });
            }
          }, response => {
            this.page_loading = false;
            this.$message({
              type: 'info',
              message: '网络连接失败，请稍后重试'
            });
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },
      filter_by_course() {
        this.get_documents(this.selected_course);
        this.page_loading = true;
      },
      refresh_data() {
        if (util.check_logged()) {
          this.$http.get(
            util.urlprefix() + '/course', {
              headers: {
                token: util.get_userinfo().token
              }
            }
          ).then(response => {
            console.log(response.body);
            if (response.body['code'] == '200') {
              var newcourses = Array.from(this.courses);
              newcourses.push.apply(newcourses, response.body['data']);
              this.courses = newcourses;
              // 修改需要的下拉菜单
              newcourses = Array.from(this.modify_courses);
              newcourses.push.apply(newcourses, response.body['data']);
              this.modify_courses = newcourses;

              // get documents
              this.get_documents(null);
            } else {
              this.$message({
                type: 'info',
                message: '验证失败'
              });
            }
          }, response => {
            this.page_loading = false;
            this.$message({
              type: 'info',
              message: '网络连接失败，请稍后重试'
            });
          });
        } else {
          this.$router.push('/');
        }
      },
      edit_course(doc_id) {
        this.modified_doc_id = doc_id;
        this.modifyBelongCourseVisible = true;
      },
      confirmSelect() {
        this.$confirm('确认修改?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.modifyBelongCourseVisible = false;
          this.page_loading = true;
          this.$http.put(
            util.urlprefix() + '/document/' + this.modified_doc_id, {
              course_id: this.modified_course
            }, {
              headers: {
                token: util.get_userinfo().token
              }
            }
          ).then(response => {
            console.log(response.body);
            if (response.body['code'] == '200') {
              // refresh tree data
              this.get_documents(this.selected_course);
              this.$message({
                type: 'success',
                message: '修改成功!'
              });
            } else {
              this.$message({
                type: 'info',
                message: '验证失败'
              });
            }
          }, response => {
            this.page_loading = false;
            this.$message({
              type: 'info',
              message: '网络连接失败，请稍后重试'
            });
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消修改'
          });
        });
      },
      get_documents(course_id) {
        var course_filter = '';
        if (course_id != null) {
          course_filter = '?course_id=' + course_id;
        }

        this.$http.get(
          util.urlprefix() + '/document' + course_filter, {
            headers: {
              token: util.get_userinfo().token
            }
          }
        ).then(response => {
          this.page_loading = false;
          console.log(response.body);
          if (response.body['code'] == '200') {
            this.tableData = response.body['data'];
          } else {
            this.$message({
              type: 'info',
              message: '验证失败'
            });
          }
        }, response => {
          this.page_loading = false;
          this.$message({
            type: 'info',
            message: '网络连接失败，请稍后重试'
          });
        });
      }
    },
    created: function() {
      if (util.check_logged()) {
        this.refresh_data();
      } else {
        this.$router.push('/');
      }
    },
    beforeDestroy: function() {
      console.log('doc_manage beforeDestroy');
    }
};
</script>
<style>
.el-col {
  border-radius: 4px;
}

.bg-purple-dark {
  background: #99a9bf;
}

.bg-purple {
  background: #d3dce6;
}

.bg-purple-light {
  background: #e5e9f2;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
}

.row-bg {
  padding: 10px 0;
  background-color: #f9fafc;
}

#upload_box {
  width: 500px;
}

#course-filter {
  margin-bottom: 20px;
}
</style>
