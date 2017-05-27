<template>
  <div v-loading.body="page_loading">
    <el-row>
      <el-col :span="17">
        <div class="grid-content bg-purple-dark">
          <el-table :data="tableData" style="width: 100%">
            <el-table-column prop="id" label="编号">
            </el-table-column>
            <el-table-column prop="name" label="课程名">
            </el-table-column>
            <el-table-column label="文档数量">
              <template scope="scope">
                <span>{{ scope.row.doc_number }}</span>
                <el-button type="text" size="small" @click="check_doc(scope.row.id)">查看</el-button>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template scope="scope">
                <el-button type="text" size="small" @click="delete_course(scope.row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="17">
        <h3>新建课程</h3>
        <div class="grid-content">
          <el-form :inline="true" :model="newCourse" class="demo-form-inline">
            <el-form-item label="课程名">
              <el-input v-model="newCourse.name" placeholder="课程名"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmit">新建</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-col>
    </el-row>
    <el-dialog title="课程内的文档" :visible.sync="checkdocDialogVisible" v-loading.body="dlg_loading">
      <el-table :data="docData" style="width: 100%">
        <el-table-column prop="id" label="编号">
        </el-table-column>
        <el-table-column prop="description" label="文档名">
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>
<script>
import * as util from '../lib/app/util.js'
export default {
  data() {
      return {
        tableData: [],
        newCourse: {
          name: ''
        },
        checkdocDialogVisible: false,
        docData: [],
        page_loading: true,
        dlg_loading: false
      }
    },
    methods: {
      onSubmit() {
        this.page_loading = true;
        this.$http.post(
          util.urlprefix() + '/course', {
            name: this.newCourse.name
          }, {
            headers: {
              token: util.get_userinfo().token
            }
          }
        ).then(response => {
          console.log(response.body['data']);
          if (response.body['code'] == '200') {
            this.$message({
              type: 'success',
              message: '创建成功'
            });
            this.refresh_data();
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
      },
      check_doc(id) {
        this.checkdocDialogVisible = true;
        this.dlg_loading = true;

        this.$http.get(
            util.urlprefix() + '/document?course_id=' + id, {
              headers: {
                token: util.get_userinfo().token
              }
            }
          ).then(response => {
            this.dlg_loading = false;
            console.log(response.body);
            if (response.body['code'] == '200') {
              this.docData = response.body['data'];
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
        } else {
          this.$router.push('/');
        }
      },
      delete_course(course_id) {
        this.$confirm('确认删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.page_loading = true;
          this.$http.delete(
            util.urlprefix() + '/course/' + course_id, {
              headers: {
                token: util.get_userinfo().token
              }
            }
          ).then(response => {
            this.page_loading = false;
            console.log(response.body);
            if (response.body['code'] == '200') {
              this.$message({
                type: 'success',
                message: '删除成功'
              });
              this.refresh_data();
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
      }
    },
  created: function() {
    if(util.check_logged()) {
      this.refresh_data();
    }
    else{
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
</style>
