<template>
  <div v-loading.body="page_loading">
    <el-row>
      <el-col :span="17">
        <div class="grid-content bg-purple-dark">
          <el-table :data="tableData" style="width: 100%">
            <el-table-column prop="id" label="编号">
            </el-table-column>
            <el-table-column prop="name" label="用户名">
            </el-table-column>
            <el-table-column label="操作">
              <template scope="scope">
                <el-button @click="modify_password(scope.row.id)" type="text" size="small">修改密码</el-button>
                <el-button @click="confirm_delete(scope.row.id)" type="text" size="small">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="17">
        <h3>新建后台管理员</h3>
        <div class="grid-content">
          <el-form :inline="true" :model="newUser" class="demo-form-inline">
            <el-form-item label="用户名">
              <el-input v-model="newUser.name" placeholder="用户名"></el-input>
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model="newUser.password" placeholder="密码"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmit">新建</el-button>
            </el-form-item>
          </el-form>
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
        newUser: {
          name: '',
          password: ''
        },
        page_loading: true
      }
    },
    methods: {
      onSubmit(manager_id) {
        this.page_loading = true;
        this.$http.post(
          util.urlprefix() + '/backend_manager', {
            username: this.newUser.name,
            password: this.newUser.password
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
      modify_password(manager_id) {
        this.$prompt('请输入新密码', '修改密码', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(newpass => {
          console.log(newpass);
          this.$http.put(
            util.urlprefix() + '/backend_manager/' + manager_id, {
              password: newpass.value
            }, {
              headers: {
                token: util.get_userinfo().token
              }
            }
          ).then(response => {
            console.log(response.body);
            if (response.body['code'] == '200') {
              // refresh tree data
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
            message: '取消输入'
          });
        });
      },
      confirm_delete(manager_id) {
        this.$confirm('将永久删除, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.page_loading = true;
          this.$http.delete(
            util.urlprefix() + '/backend_manager/' + manager_id, {
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
            message: '已取消删除'
          });
        });
      },
      refresh_data() {
        if (util.check_logged()) {
          this.$http.get(
            util.urlprefix() + '/backend_manager', {
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
</style>
