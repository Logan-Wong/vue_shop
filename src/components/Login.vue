<template>
    <div class="login_container">
        <div class="login_box">
            <!-- 头像区域 -->
            <div class="avator_box">
                <img src="../assets/logo.png" alt="">
            </div>
            <!-- 登陆表单区域 -->
            <el-form ref="loginFormRef" label-width="0px" class="login_form" :model="loginForm" :rules="loginRules">
                <!-- 用户名 -->
                <el-form-item prop="username">
                    <el-input prefix-icon="iconfont icon-user" v-model="loginForm.username"></el-input>
                </el-form-item>
                <!-- 密码 -->
                <el-form-item prop="password">
                    <el-input type="password" prefix-icon="iconfont icon-3702mima" v-model="loginForm.password"></el-input>
                </el-form-item>
                <!-- 按钮 -->
                <el-form-item class="btns">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="info" @click="resetLoginForm">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
export default {
  data () {
    return {
      // 登录表单的数据绑定
      loginForm: {
        username: 'zhangsan',
        password: '123456'
      },
      // 表单的验证规则对象
      loginRules: {
        // 验证用户名
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' }
        ],
        // 验证密码
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetLoginForm () {
      // console.log(this)
      // 此处 this 指向 form 表单
      this.$refs.loginFormRef.resetFields()
    },
    login () {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        // 只把其中的 data 字段解构出来，其他的都是 axios 封装的
        const { data: res } = await this.$http.post('login', this.loginForm)
        if (res.meta.status !== 200) return this.$message.error('登录失败！！！')
        this.$message.success('恭喜你，登录成功了~')
        // 记录登录成功后的 token，保存在 sessionStorage 中（关闭网页失效）
        window.sessionStorage.setItem('token', res.data.token)
        // 编程式导航跳转到后台主页
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
    position: relative;
    height: 100%;
    background: #2b4b6b;
}
.login_box {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 450px;;
    height: 300px;
    background-color: #fff;
    border-radius: 5px;
    transform: translate(-50%, -50%);
    .avator_box {
        position: absolute;
        left: 50%;
        height: 130px;
        width: 130px;
        padding: 8px;
        border: 1px solid #eee;
        box-shadow: 0 0 10px #ddd;
        background-color: #fff;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        img {
            height: 100%;
            width: 100%;
            border: 1px solid #eee;
            border-radius: 50%;
            background-color: #eee;
        }
    }
    .login_form {
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 20px;
        // 盒子模型，box-sizing 默认值为 content-box
        // 设置为 border-box，边框和内边距的值是包含在width内的
        box-sizing: border-box;
        .btns {
            display: flex;
            justify-content: flex-end;
        }
    }
}
</style>
