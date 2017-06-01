<template>
  <div>
    <el-form :model="userInfo" label-width="120px" style="width: 50%;">
      <el-form-item label="当前用户名">
        {{ userInfo.username }}
      </el-form-item>
      <el-form-item label="修改密码">
        <el-input v-model="userInfo.password" type="password"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="confirm_modify">修改密码</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import * as util from '../lib/app/util.js'

export default {
  data() {
      return {
        userInfo: {
          username: '',
          password: ''
        }
      };
    },
    methods: {
      refresh_data() {
        if (util.check_logged()) {
          this.userInfo.username = util.get_userinfo().username;
        } else {
          this.$router.push('/');
        }
      },
      confirm_modify() {
        this.$confirm('proceed modify?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          var modify_url = '';
          if(util.get_userinfo().logtype == 1){
            // school user
            modify_url = '/school_user/';
          }
          else if (util.get_userinfo().logtype == 2){
            // school manager
            modify_url = '/school_manager/';
          }
          else{
            // backend manager
            modify_url = '/backend_manager/';
          }
          this.$http.put(
            util.urlprefix() + modify_url + util.get_userinfo().id, {
              password: this.userInfo.password
            },{
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
                message: '成功'
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
            /*
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
          */
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
</style>
