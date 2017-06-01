<template>
  <div>
    <h1>欢迎来到文档管理系统</h1>
    <div v-if='!logged_in' id='log-box'>
      <h2>您还没有登录，请先登录</h2>
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="username"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="password"></el-input>
        </el-form-item>
        <el-form-item label="帐号类型">
          <el-select v-model="form.logtype" placeholder="请选择帐号类型">
            <el-option label="学校用户" value="1"></el-option>
            <el-option label="学校管理员" value="2"></el-option>
            <el-option label="后台管理员" value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div v-else>
      <h2>您好，{{ userinfo.username }}</h2>
    </div>
  </div>
</template>
<script>
import * as util from '../lib/app/util.js'

export default {
  data() {
      return {
        logged_in: util.check_logged(),
        form: {
          username: '',
          password: '',
          logtype: null
        },
        userinfo: util.get_userinfo()
      };
    },
    methods: {
      onSubmit() {
        console.log(this.form);
        this.$http.post(util.urlprefix() + '/login', this.form).then(response => {
          console.log(response.body);
          if (response.body['code'] == '200') {

            var token = response.body['data']['token'];
            console.log(token);
            util.set_userinfo({
              id: response.body['data']['userinfo']['id'],
              username: this.form.username,
              logtype: this.form.logtype,
              token: token
            });
            location.reload();
          } else {
            this.$message({
              type: 'info',
              message: '验证失败'
            });
          }
        }, response => {
          this.$message({
            type: 'info',
            message: '网络连接失败，请稍后重试'
          });
        });
      }
    }
};
</script>
<style>
#log-box {
  width: 500px;
}
</style>
