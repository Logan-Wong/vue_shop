<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片式视图区域 -->
    <el-card>
      <!-- 首行，搜索框、搜索按钮和添加用户按钮 -->
      <el-row :gutter="20" class="firstRow">
        <el-col :span="6">
          <el-input placeholder="请输入内容" clearable v-model="queryInfo.query" @clear="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 非首行，用户列表表格区域 -->
      <el-table
        :data="orderList"
        border
        style="width: 100%">
        <el-table-column
          type="index"
          label="#">
        </el-table-column>
        <el-table-column
          prop="order_number"
          label="订单编号">
        </el-table-column>
        <el-table-column
          prop="order_price"
          label="订单价格"
          width="100">
        </el-table-column>
        <el-table-column
          prop="pay_status"
          label="是否付款"
          width="100">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="is_send"
          label="是否发货"
          width="100">
        </el-table-column>
        <el-table-column
          prop="create_time"
          label="下单时间"
          width="180">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            {{scope.row.create_time | dataFormat}}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="150">
          <template slot-scope="scope">
            <!-- 编辑地址按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editAddress(scope.row.id)"></el-button>
            <!-- 查看物流信息按钮 -->
            <el-button type="success" icon="el-icon-location" size="mini" @click="showOrderWuLiu(scope.row.id)"></el-button>
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
    <!-- 修改地址 弹框 -->
    <el-dialog title="修改地址" :visible.sync="editAddressDialogVisible">
      <el-form :model="editAddressObj" :rules="editAddressRules" ref="editAddressRef">
        <el-form-item label="省市区/县" label-width="100px" prop="address1">
          <!-- 级联选择器 -->
          <!-- v-model 已选中的 id 数组 -->
          <!-- options 数据源 -->
          <!-- props 配置选项 -->
          <el-cascader
            style="width: 100%"
            v-model="selectedIdList"
            :options="cityData"
            :props="cascaderProps"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" label-width="100px" prop="address2">
          <el-input v-model="editAddressObj.address2"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editAddressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAddressDialogVisible = false">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 物流进度 弹框 -->
    <el-dialog title="物流进度" :visible.sync="wuLiuProgressDialogVisible">
       <el-timeline :reverse="true">
        <el-timeline-item
          v-for="(item, index) in wuLiuProgressList"
          :key="index"
          :timestamp="item.time">
          {{item.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
// 导入城市数据
import cityData from './citydata.js'

export default {
  data () {
    return {
      // 订单列表查询参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 订单列表
      orderList: [],
      // 总订单数量
      total: null,
      // 控制修改地址弹框的显示与隐藏
      editAddressDialogVisible: false,
      // 双向绑定修改地址弹框中表单的值
      editAddressObj: {
        address1: '',
        address2: ''
      },
      // 表单的验证规则对象
      editAddressRules: {
        // 验证省市区/县
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }
        ],
        // 验证详细地址
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      // 城市数据，用于渲染省市区/县级联选择器
      cityData: cityData,
      // 级联选择器 已选择的 id 数组
      selectedIdList: [],
      // 级联选择器的配置项
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'value',
        label: 'label',
        children: 'children'
      },
      // 控制物流进度弹框的显示与隐藏
      wuLiuProgressDialogVisible: false,
      // 存放物流进度的数组
      wuLiuProgressList: []
    }
  },
  created () {
    this.getOrderList()
  },
  methods: {
    // 获取订单列表
    async getOrderList () {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('查询订单列表失败！')
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    // 一页显示数据条数有变化
    handleSizeChange (val) {
      this.queryInfo.pagesize = val
      this.getOrderList()
    },
    // 当前页有变化
    handleCurrentChange (val) {
      this.queryInfo.pagenum = val
      this.getOrderList()
    },
    // 点击编辑地址按钮
    editAddress () {
      // 显示 修改地址 弹框
      this.editAddressDialogVisible = true
    },
    // 点击查看物流信息按钮
    showOrderWuLiu () {
      // 获取物流信息
      this.getWuLiuInfo()
      this.wuLiuProgressDialogVisible = true
    },
    // 获取物流信息
    async getWuLiuInfo () {
      const { data: res } = await this.$http.get('/kuaidi/804909574412544580')
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('查看物流信息失败！')
      this.wuLiuProgressList = res.data
    }
  }
}
</script>

<style lang="less" scoped>
.firstRow {
  margin-bottom: 15px;
}
</style>
