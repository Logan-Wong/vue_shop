<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 权限列表表格区域 -->
      <el-table
        :data="powerList"
        border
        style="width: 100%">
        <el-table-column
          type="index"
          label="#"
          width="63">
        </el-table-column>
        <el-table-column
          prop="authName"
          label="权限名称"
          width="400">
        </el-table-column>
        <el-table-column
          prop="path"
          label="路径"
          width="400">
        </el-table-column>
        <el-table-column
          prop="level"
          label="权限等级"
          width="400">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level == 0">一级</el-tag>
            <el-tag v-else-if="scope.row.level == 1" type="success">二级</el-tag>
            <el-tag v-else type="warning">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 权限列表
      powerList: []
    }
  },
  created () {
    this.getPowerList()
  },
  methods: {
    // 获取权限列表
    async getPowerList () {
      const { data: res } = await this.$http.get('rights/list')
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('请求数据失败！')
      }
      // this.$message.success('请求数据成功！')
      this.powerList = res.data
    }
  }
}
</script>

<style lang="less" scoped>
.el-table {
  // margin-top: 15px;
}
</style>
