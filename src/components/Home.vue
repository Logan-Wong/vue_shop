<template>
    <div>
        <el-button type="info" @click="logout">退出</el-button>
    </div>
</template>

<script>
export default {
  methods: {
    logout () {
      // 清除 token 则表示退出登录
      window.sessionStorage.clear()
      // 编程式导航跳转到登录页面
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped>
</style>
