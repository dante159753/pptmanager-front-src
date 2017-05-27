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
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
    
  </div>
</template>
<script>
import * as util from '../lib/app/util.js'

export default {
  data() {
      return {
        tableData: [],
        fileList: [{
          name: 'food.jpeg',
          url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'
        }, {
          name: 'food2.jpeg',
          url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'
        }],
        courses: [{
          id: null,
          name: '所有'
        }, {
          id: 0,
          name: '无所属课程'
        }],
        selected_course: null,
        page_loading: true
      };
    },
    methods: {
      filter_by_course() {
        this.get_documents(this.selected_course);
        this.page_loading = true;
      },
      download(doc_id) {
        window.open(util.urlprefix() + '/docfile/' + doc_id, '_blank');
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
      get_documents(course_id) {
        var filter = '?';
        var userinfo = util.get_userinfo();
        if (course_id != null) {
          filter += 'course_id=' + course_id;
          filter += '&logtype=' + userinfo.logtype;
          filter += '&username=' + userinfo.username;
        }
        else {
          filter += 'logtype=' + userinfo.logtype;
          filter += '&username=' + userinfo.username;
        }

        this.$http.get(
          util.urlprefix() + '/document' + filter, {
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
