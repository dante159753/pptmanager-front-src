<template>
  <div v-loading.body="page_loading">
    <el-row>
      <el-col :span="17">
        <div class="grid-content bg-purple-dark">
          <el-table :data="tableData" style="width: 100%">
            <el-table-column prop="id" label="编号">
            </el-table-column>
            <el-table-column prop="name" label="学校名">
            </el-table-column>
            <el-table-column label="操作">
              <template scope="scope">
                <el-button type="text" size="small" @click="check_doc_tree(scope.row.id)">查看可见文档</el-button>
                <el-button type="text" size="small" @click="modify(scope.row.id)">编辑可见文档</el-button>
                <el-button type="text" size="small" @click="delete_school(scope.row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="17">
        <h3>新建学校</h3>
        <div class="grid-content">
          <el-form :inline="true" :model="newSchool" class="demo-form-inline">
            <el-form-item label="课程名">
              <el-input v-model="newSchool.name" placeholder="学校名"></el-input>
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
        tableData: [],
        newSchool: {
          name: ''
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
        modified_school_id: null,
        max_doc_id: 0
      };
    },
    methods: {
      onSubmit() {
        this.page_loading = true;
        this.$http.post(
          util.urlprefix() + '/school', {
            name: this.newSchool.name
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
      check_doc_tree(id) {
        this.checkdocDialogVisible = true;
        this.dlg1_loading = true;
        this.$http.get(
          util.urlprefix() + '/school/' + id, {
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
        this.modified_school_id = id;
        this.modifydocDialogVisible = true;
        this.dlg2_loading = true;
        this.$http.get(
          util.urlprefix() + '/school/' + id, {
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
            util.urlprefix() + '/school/' + this.modified_school_id, {
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
              this.modify(this.modified_school_id)
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
          this.$http.get(
            util.urlprefix() + '/school', {
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
      delete_school(school_id) {
        this.$confirm('确认删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.page_loading = true;
          this.$http.delete(
            util.urlprefix() + '/school/' + school_id, {
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
