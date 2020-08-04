<template>
  <el-container class="home_box">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="" />
        <span>电商管理平台首页</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!-- 左侧菜单栏区域 -->
      <el-aside :width="isCollapse ? 60 + 'px': 200 + 'px'">
        <div class="asideCollapse" @click="ifCollapse">|||</div>
        <el-menu
          :default-active="'/' + active"
          class="el-menu-vertical-demo"
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
        >
          <!-- 一级导航 -->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="menuIcon[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级导航 -->
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="activeItem(subItem.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主体内容区域 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      // 用于保存从接口接收的菜单列表数据
      menuList: [],
      // 用于存放一级导航图标的对象
      menuIcon: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      // 是否折叠侧边栏
      isCollapse: false,
      // 当前激活的二级导航项目
      active: null
    }
  },
  created () {
    // 在页面一上来就请求侧边栏数据
    this.getMenuList()
    this.getCurActive()
  },
  methods: {
    logout () {
      // 清除 token 则表示退出登录
      window.sessionStorage.clear()
      // 编程式导航跳转到登录页面
      this.$router.push('/login')
    },
    // 获取菜单列表数据，保存到 menuList
    async getMenuList () {
      // 发送 axios 请求获取左侧菜单数据
      const { data: res } = await this.$http.get('menus')
      // console.log(res.data)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
    },
    // 切换侧边栏
    ifCollapse () {
      this.isCollapse = !this.isCollapse
    },
    // 保存当前激活二级导航项目到 sessionStorage
    activeItem (path) {
      window.sessionStorage.setItem('activeItem', path)
      this.getCurActive()
    },
    // 从 sessionStorage 中获取当前激活二级导航项目
    getCurActive () {
      this.active = window.sessionStorage.getItem('activeItem')
    }
  }
}
</script>

<style lang="less" scoped>
.el-menu {
  border-right: none;
  .el-submenu {
    span {
      margin-left: 10px;
    }
  }
}
.home_box {
  height: 100%;
}
.el-header {
  display: flex;
  // flex 布局，先两边贴边，再平分剩余空间
  justify-content: space-between;
  padding-left: 0;
  background-color: #373d41;
  // 使右侧按钮高度不拉满
  align-items: center;
  div {
    display: flex;
    align-items: center;
    span {
      margin-left: 10px;
      color: #fff;
      font-size: 20px;
      // line-height: 5px;
      vertical-align: text-bottom;
    }
  }
}
.el-aside {
  background-color: #333744;
  .asideCollapse {
    height: 30px;
    color: #fff;
    font-size: 18px;
    line-height: 28px;
    text-align: center;
    background-color: #4a5064;
    cursor: pointer;
  }
}
.el-main {
  background-color: #eaedf1;
}
</style>
