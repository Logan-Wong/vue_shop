<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 首行，搜索框、搜索按钮和添加商品按钮 -->
      <el-row :gutter="20" class="firstRow">
        <el-col :span="6">
          <el-input placeholder="请输入内容" clearable v-model="queryInfo.query" @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="18">
          <el-button type="primary" @click="addGoods">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 非首行，商品列表表格区域 -->
      <el-table
        :data="goodsList.goods"
        border
        style="width: 100%">
        <el-table-column
          type="index"
          label="#">
        </el-table-column>
        <el-table-column
          prop="goods_name"
          label="商品名称">
        </el-table-column>
        <el-table-column
          prop="goods_price"
          label="商品价格(元)"
          width="120">
        </el-table-column>
        <el-table-column
          prop="goods_weight"
          label="商品重量"
          width="100">
        </el-table-column>
        <el-table-column
          prop="add_time"
          label="创建时间"
          width="180">
          <template slot-scope="scope">
            {{scope.row.add_time | dataFormat}}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="130">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <!-- 编辑用户按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <!-- 删除用户按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini"  @click="delGoods(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 完整分页布局 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 编辑商品 弹框 -->
    <!-- <el-dialog title="修改商品信息" :visible.sync="editUserDialogVisible">
      <el-form :model="editUserObj" :rules="editUserRules" ref="editUserRef">
        <el-form-item label="用户名" label-width="80px" prop="username">
          <el-input v-model="editUserObj.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" label-width="80px" prop="email">
          <el-input v-model="editUserObj.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" label-width="80px" prop="mobile">
          <el-input v-model="editUserObj.mobile"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserDialogSure">确 定</el-button>
      </div>
    </el-dialog> -->
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品列表
      goodsList: {},
      // 获取商品列表时所需的参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 总数据条数
      total: null,
      // 搜索框双向绑定的数据
      searchInput: ''
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    // 获取商品列表
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败!')
      this.goodsList = res.data
      this.total = this.goodsList.total
    },
    // 当前页要展示的数据条数发生改变 触发
    handleSizeChange (val) {
      this.queryInfo.pagesize = val
      this.getGoodsList()
    },
    // 当前页码改变 触发
    handleCurrentChange (val) {
      this.queryInfo.pagenum = val
      this.getGoodsList()
    },
    // 点击删除商品按钮 触发
    async delGoods (id) {
      // 弹出 MessageBox 弹框
      const confirmData = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 点击 取消， confirmData 为 cancel
      // 点击 确定， confirmData 为 confirm
      // 用户点击了取消按钮
      if (confirmData !== 'confirm') {
        return this.$message.info('已取消删除~')
      }
      // 执行到这里，代表用户点了确定
      const { data: res } = await this.$http.delete('goods/' + id)
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('删除商品失败！')
      this.$message.success('删除商品成功！')
      this.getGoodsList()
    },
    // 点击添加商品按钮
    addGoods () {
      // 编程式导航,跳转到新页面
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang="less" scoped>
.firstRow {
  margin-bottom: 15px;
}
</style>
