<template>
  <div v-loading.body="page_loading">
    <el-select placeholder="按学校筛选" @change='filter_by_school' v-model="selected_school" style='margin-bottom: 20px' v-if='is_backend'>
      <el-option v-for="school in schools" :key="school.id" :label="school.name" :value="school.id">
      </el-option>
    </el-select>
    <el-row>
      <el-col :span="17">
        <div class="grid-content bg-purple-dark">
          <el-table :data="tableData" style="width: 100%">
            <el-table-column prop="id" label="编号">
            </el-table-column>
            <el-table-column prop="username" label="用户名">
            </el-table-column>
            <el-table-column prop="school.name" label="所属学校">
            </el-table-column>
            <el-table-column label="可见文档">
              <template scope="scope">
                <!-- <span>{{ scope.row.doc_number }}</span> -->
                <el-button type="text" size="small" @click="check_doc_tree(scope.row.id)">查看</el-button>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template scope="scope">
                <el-button type="text" size="small" @click="modify(scope.row.id)">编辑可见文档</el-button>
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
        <h3>新建学校用户</h3>
        <div class="grid-content">
          <el-form :inline="true" :model="newUser" class="demo-form-inline">
            <el-form-item label="用户名">
              <el-input v-model="newUser.username" placeholder="用户名"></el-input>
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model="newUser.password" placeholder="密码"></el-input>
            </el-form-item>
            <el-form-item label="所属学校" v-if='is_backend'>
              <el-select placeholder="选择所属学校" v-model="school_of_new">
                <el-option v-for="school in schools" :key="school.id" :label="school.name" :value="school.id">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmit">新建</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-col>
    </el-row>
    <el-dialog title="可见文档" :visible.sync="checkdocDialogVisible" v-loading.body="dlg1_loading">
      <el-tree :data="visible_doc_tree" :props="defaultProps"></el-tree>
    </el-dialog>
    <el-dialog title="可见文档修改" :visible.sync="modifydocDialogVisible" v-loading.body="dlg2_loading">
      <el-tree :data="modify_doc_tree" show-checkbox default-expand-all node-key="node_id" :default-checked-keys="checked_nodes" ref="modify_visible_tree" highlight-current :props="defaultProps">
      </el-tree>
      <el-button type="primary" style="margin-top: 20px" @click="confirmSelect">确认修改</el-button>
    </el-dialog>
  </div>
</template>
<script>
import * as util from '../lib/app/util.js'
export default {
  data() {
      return {
        tableData: [{
          id: '1',
          username: 'manager1',
          doc_number: 1,
          school: {
            name: 'null'
          }
        }],
        newUser: {
          username: '',
          password: ''
        },

        checkdocDialogVisible: false,
        modifydocDialogVisible: false,

        visible_doc_tree: [],
        modify_doc_tree: [],
        defaultProps: {
          children: 'children',
          label: 'label'
        },
        page_loading: true,
        dlg1_loading: false,
        dlg2_loading: false,
        checked_nodes: [],
        modified_user_id: null,
        max_doc_id: 0,

        schools: [],
        selected_school: null,
        school_of_new: null,
        is_backend: true
      }
    },
    methods: {
      onSubmit() {
        this.page_loading = true;
        this.$http.post(
          util.urlprefix() + '/school_user', {
            username: this.newUser.username,
            password: this.newUser.password,
            school_id: this.school_of_new
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
            this.get_users(this.selected_school);
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
      modify_password(user_id) {
        this.$prompt('请输入新密码', '修改密码', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(newpass => {
          console.log(newpass);
          this.$http.put(
            util.urlprefix() + '/school_user/' + user_id, {
              password: newpass.value
            }, {
              headers: {
                token: util.get_userinfo().token
              }
            }
          ).then(response => {
            console.log(response.body);
            if (response.body['code'] == '200') {
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
      confirm_delete(user_id) {
        this.$confirm('确认删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.page_loading = true;
          this.$http.delete(
            util.urlprefix() + '/school_user/' + user_id, {
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
              this.get_users(this.selected_school);
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
      check_doc_tree(id) {
        this.checkdocDialogVisible = true;
        this.dlg1_loading = true;
        this.$http.get(
          util.urlprefix() + '/school_user/' + id, {
            headers: {
              token: util.get_userinfo().token
            }
          }
        ).then(response => {
          this.dlg1_loading = false;
          console.log(response.body['data']);
          if (response.body['code'] == '200') {
            this.visible_doc_tree = response.body['data']['visible_doc_tree'];
          } else {
            this.$message({
              type: 'info',
              message: '验证失败'
            });
          }
        }, response => {
          this.dlg1_loading = false;
          this.$message({
            type: 'info',
            message: '网络连接失败，请稍后重试'
          });
        });
      },
      modify(id) {
        this.modified_user_id = id;
        this.modifydocDialogVisible = true;
        this.dlg2_loading = true;
        this.$http.get(
          util.urlprefix() + '/school_user/' + id, {
            headers: {
              token: util.get_userinfo().token
            }
          }
        ).then(response => {
          this.dlg2_loading = false;
          console.log(response.body['data']);
          if (response.body['code'] == '200') {
            this.visible_doc_tree = response.body['data']['visible_doc_tree'];
            this.modify_doc_tree = response.body['data']['modify_doc_tree'];
            this.checked_nodes = response.body['data']['checked_nodes'];
            this.max_doc_id = response.body['data']['max_doc_id'];
          } else {
            this.$message({
              type: 'info',
              message: '验证失败'
            });
          }
        }, response => {
          this.dlg2_loading = false;
          this.$message({
            type: 'info',
            message: '网络连接失败，请稍后重试'
          });
        });
      },
      confirmSelect() {
        console.log(this.$refs.modify_visible_tree.getCheckedNodes());
        this.$confirm('确认修改?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http.put(
            util.urlprefix() + '/school_user/' + this.modified_user_id, {
              checked_nodes: JSON.stringify(this.$refs.modify_visible_tree.getCheckedKeys().filter(
                (nodeid) => parseInt(nodeid) <= parseInt(this.max_doc_id)
              ))
            }, {
              headers: {
                token: util.get_userinfo().token
              }
            }
          ).then(response => {
            this.page_loading = false;
            console.log(response.body);
            if (response.body['code'] == '200') {
              // refresh tree data
              this.modify(this.modified_user_id)
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
      refresh_data() {
        if (util.check_logged()) {
          if (util.get_userinfo().logtype == 2) {
            // school manager
            this.is_backend = false;
            this.$http.get(
              util.urlprefix() + '/school_manager?username=' + util.get_userinfo().username, {
                headers: {
                  token: util.get_userinfo().token
                }
              }
            ).then(response => {
              console.log(response.body);
              if (response.body['code'] == '200') {
                this.selected_school = response.body.data.school.id;
                this.school_of_new = response.body.data.school.id;

                // get documents
                this.get_users(this.selected_school);
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
            // backend manager
            this.$http.get(
              util.urlprefix() + '/school', {
                headers: {
                  token: util.get_userinfo().token
                }
              }
            ).then(response => {
              console.log(response.body);
              if (response.body['code'] == '200') {
                var newschools = Array.from(this.schools);
                newschools.push.apply(newschools, response.body['data']);
                this.schools = newschools;

                // get documents
                this.get_users(null);
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


        } else {
          this.$router.push('/');
        }
      },
      get_users(school_id) {
        var school_filter = '';
        if (school_id != null) {
          school_filter = '?school_id=' + school_id;
        }

        this.$http.get(
          util.urlprefix() + '/school_user' + school_filter, {
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
      },
      filter_by_school() {
        this.page_loading = true;
        this.get_users(this.selected_school);
      }

    },
    created: function() {
      this.refresh_data();
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
