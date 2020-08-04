<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 首行，添加分类按钮 -->
      <el-row class="firstRow">
        <el-button type="primary" @click="addGoodsCate">添加分类</el-button>
      </el-row>
      <!-- 非首行，分类列表表格区域 -->
      <tree-table :data="goodsCateList" :columns="columns"
        :show-index="true" :expand-type="false" :selection-type="false"
        border index-text="#">
        <!-- 是否有效 作用域插槽 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted == false" style="color: green"></i>
          <i class="el-icon-error" v-else  style="color: red"></i>
        </template>
        <!-- 排序 作用域插槽 -->
        <template slot="sort" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level == 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level == 1">二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 作用域插槽 -->
        <template slot="edit" slot-scope="scope">
          <!-- 编辑分类按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editGoodsCate(scope.row)">编辑</el-button>
            <!-- 删除分类按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="delGoodsCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 完整分页布局 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 3, 5]"
        :page-size="queryInfo.pagesize"
        layout="total, prev, pager, next, jumper"
        :total="totalPage">
      </el-pagination>
    </el-card>
    <!-- 添加分类 弹框 -->
    <el-dialog title="添加分类" :visible.sync="addGoodsCateDialogVisible">
      <el-form :model="addGoodsCateObj" :rules="addGoodsCateRules" ref="addGoodsCateRef">
        <el-form-item label="分类名称" label-width="80px" prop="cat_name">
          <el-input v-model="addGoodsCateObj.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类" label-width="80px">
          <!-- 级联选择器 -->
          <!-- v-model 已选中的 id 数组 -->
          <!-- options 数据源 -->
          <!-- props 配置选项 -->
          <el-cascader
            style="width: 100%; max-height: 200px"
            v-model="selectedIdList"
            :options="parentCateList"
            :props="parentProps"
            @change="goodsCateItemChange"
            clearable></el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addGoodsCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addGoodsCateDialogSure">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 编辑分类 弹框 -->
    <el-dialog title="修改分类" :visible.sync="editGoodsCateDialogVisible">
      <el-form :model="editGoodsCateObj" :rules="editGoodsCateRules" ref="editGoodsCateRef">
        <el-form-item label="分类名称" label-width="80px"  prop="cat_name">
          <el-input v-model="editGoodsCateObj.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editGoodsCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editGoodsCateDialogSure">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类列表
      goodsCateList: [],
      // 查询参数
      queryInfo: {
        type: 3,
        pagesize: 5,
        pagenum: 1
      },
      // 总页数
      totalPage: null,
      // tree-table 表格各列的配置
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
          width: '300px'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'sort'
        },
        {
          label: '操作',
          type: 'template',
          template: 'edit'
        }
      ],
      // 控制添加分类弹框是否显示
      addGoodsCateDialogVisible: false,
      // 保存添加分类弹框表单中的数据
      addGoodsCateObj: {
        // 父级分类 id,默认为 0,也即是没有选级联选择器,当前要添加的分类应该为一级分类
        cat_pid: 0,
        cat_name: '',
        // 分类等级,默认同为 0
        cat_level: 0
      },
      // 表单的验证规则对象
      addGoodsCateRules: {
        // 验证分类名称
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
        ]
      },
      // 父级分类数据列表
      parentCateList: [],
      // 父级分类 props
      parentProps: {
        checkStrictly: true,
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择器选中的 id 数组
      selectedIdList: [],
      // 保存编辑分类表单中的数据
      editGoodsCateObj: {
        cat_name: ''
      },
      // 控制编辑分类弹框的显示与否
      editGoodsCateDialogVisible: false,
      // 当前商品 id
      curGoodsId: null,
      // 表单的验证规则对象
      editGoodsCateRules: {
        // 验证分类名称
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getGoodsCateList()
  },
  methods: {
    // 获取商品分类列表
    async getGoodsCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('请求数据失败！')
      }
      // this.$message.success('请求数据成功！')
      this.goodsCateList = res.data.result
      // console.log(this.goodsCateList)
      // 赋值总页数
      this.totalPage = res.data.total
    },
    // 页码大小改变
    handleSizeChange (val) {
      // console.log(`每页 ${val} 条`)
      this.queryInfo.pagesize = val
      this.getGoodsCateList()
    },
    // 当前页码改变
    handleCurrentChange (val) {
      // console.log(`当前页: ${val}`)
      this.queryInfo.pagenum = val
      this.getGoodsCateList()
    },
    // 按下添加分类按钮
    addGoodsCate () {
      // 请求父级分类数据,保存到 parentCateList
      this.getParentCateList()
      // 显示添加分类信息弹框
      this.addGoodsCateDialogVisible = true
    },
    // 请求父级分类数据
    async getParentCateList () {
      // 只请求两级父级分类数据
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('请求数据失败！')
      }
      // this.$message.success('请求数据成功！')
      this.parentCateList = res.data
      // console.log(res.data)
    },
    // 级联选择器中的选项发生改变,变化后的 id 数组
    // 将自动同步到 v-model 绑定的数组中
    goodsCateItemChange () {
      // console.log(this.selectedIdList)
      // 选了级联选择器中的父分类
      if (this.selectedIdList.length > 0) {
        // 将选中的 id 数组中最后一个值更新到 cat_pid
        this.addGoodsCateObj.cat_pid = this.selectedIdList[this.selectedIdList.length - 1]
        // 将 selectedIdList 数组中元素的个数更新到 cat_level
        this.addGoodsCateObj.cat_level = this.selectedIdList.length
      } else {
        // 没选
        // cat_pid 赋值为初始值
        this.addGoodsCateObj.cat_pid = 0
        // cat_level 赋值为初始值
        this.addGoodsCateObj.cat_level = 0
      }
    },
    // 按下添加分类弹框确定按钮
    addGoodsCateDialogSure () {
      // console.log(this.addGoodsCateObj)
      // 表单预检验
      this.$refs.addGoodsCateRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addGoodsCateObj)
        // console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }
        this.$message.success('添加分类成功！')
        // 让添加分类弹框隐藏
        this.addGoodsCateDialogVisible = false
        // 清空表单
        // this.$refs.editUserRef.resetFields()
        // 刷新商品分类列表
        this.getGoodsCateList()
      })
    },
    // 按下编辑商品分类按钮
    // goodsInfo: 当前要编辑的商品信息
    editGoodsCate (goodsInfo) {
      this.curGoodsId = goodsInfo.cat_id
      // console.log(goodsInfo)
      this.getGoodsCateById(goodsInfo.cat_id)
      // 显示编辑分类弹框
      this.editGoodsCateDialogVisible = true
    },
    // 根据 id 查询分类
    async getGoodsCateById (id) {
      const { data: res } = await this.$http.get('categories/' + id)
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('根据 id 查询分类失败!')
      // this.$message.success('根据 id 查询分类成功!')
      this.editGoodsCateObj.cat_name = res.data.cat_name
    },
    // 按下了编辑商品分类弹框的确定按钮
    editGoodsCateDialogSure () {
      // 表单的预校验
      this.$refs.editGoodsCateRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('categories/' + this.curGoodsId, {
          cat_name: this.editGoodsCateObj.cat_name
        })
        // console.log(res)
        if (res.meta.status !== 200) return this.$message.error('修改分类失败!')
        // 让编辑分类弹框隐藏
        this.editGoodsCateDialogVisible = false
        this.$message.success('修改分类成功!')
        // 刷新商品分类列表
        this.getGoodsCateList()
      })
    },
    // 按下删除分类按钮,根据 id 删除分类
    async delGoodsCate (id) {
      // 弹出 MessageBox 弹框
      const confirmData = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
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
      const { data: res } = await this.$http.delete('categories/' + id)
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('删除分类失败！')
      this.$message.success('删除分类成功！')
      this.getGoodsCateList()
    }
  }
}
</script>

<style lang="less" scoped>
.firstRow {
  margin-bottom: 15px;
}
</style>
