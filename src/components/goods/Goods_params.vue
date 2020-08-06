<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert
        title="注意: 只允许为第三级分类设置相关属性!"
        type="warning"
        show-icon
        :closable="false">
      </el-alert>
      <el-row>
        <el-col class="selectGoods">
          <!-- 选择商品分类区域 -->
          <span style="margin-right: 10px">选择商品分类:</span>
          <!-- 级联选择器 -->
          <!-- v-model 已选中的 id 数组 -->
          <!-- options 数据源 -->
          <!-- props 配置选项 -->
          <el-cascader
            style="width: 20%; max-height: 200px"
            v-model="selectedIdList"
            :options="parentCateList"
            :props="parentProps"
            @change="goodsParamsItemChange"></el-cascader>
        </el-col>
      </el-row>
      <!-- tab 栏区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 动态参数区域 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数按钮 -->
          <el-row class="addParams">
            <el-button type="primary" :disabled="addParamsBtnVisible" @click="addDynamicParams">添加参数</el-button>
          </el-row>
          <!-- 参数表格区域 -->
          <el-table
            :data="paramsTableData"
            border
            style="width: 100%">
            <el-table-column
              type="expand">
              <!-- tab标签 作用域插槽 -->
              <template slot-scope="scope">
                <!-- tag 标签 -->
                <el-tag
                  class="paramsTab"
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                  type="success">
                  {{item}}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column
              type="index"
              label="#">
            </el-table-column>
            <el-table-column
              prop="attr_name"
              label="参数名称">
            </el-table-column>
            <el-table-column
              label="操作">
              <!-- 操作 作用域插槽 -->
              <template slot-scope="scope">
                <!-- 修改参数按钮 -->
                  <el-button type="primary" icon="el-icon-edit" size="mini" @click="editDynamicParams(scope.row)">修改</el-button>
                  <!-- 删除参数按钮 -->
                  <el-button type="danger" icon="el-icon-delete" size="mini" @click="delDynamicParams(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性区域 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加参数按钮 -->
          <el-row class="addParams">
            <el-button type="primary" :disabled="addParamsBtnVisible"  @click="addDynamicParams">添加属性</el-button>
          </el-row>
          <!-- 参数表格区域 -->
          <el-table
            :data="paramsTableData"
            border
            style="width: 100%">
            <el-table-column
              type="expand">
              <!-- tab标签 作用域插槽 -->
              <template slot-scope="scope">
                <!-- tab标签 -->
                <el-tag
                  class="paramsTab"
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                  type="success">
                  {{item}}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column
              type="index"
              label="#">
            </el-table-column>
            <el-table-column
              prop="attr_name"
              label="参数名称">
            </el-table-column>
            <el-table-column
              label="操作">
              <!-- 操作 作用域插槽 -->
              <template slot-scope="scope">
                <!-- 修改参数按钮 -->
                  <el-button type="primary" icon="el-icon-edit" size="mini"  @click="editDynamicParams(scope.row)">修改</el-button>
                  <!-- 删除参数按钮 -->
                  <el-button type="danger" icon="el-icon-delete" size="mini" @click="delDynamicParams(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加动态参数/静态属性 弹框 -->
    <el-dialog :title="'添加' + dynamicOrStatic" :visible.sync="addDynamicParamsDialogVisible">
      <el-form :model="addDynamicParamsObj" :rules="addDynamicParamsRules" ref="addDynamicParamsRef">
        <el-form-item :label="dynamicOrStatic" label-width="80px" prop="attr_name">
          <el-input v-model="addDynamicParamsObj.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDynamicParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addDynamicParamsDialogSure">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 修改动态参数/静态属性 弹框 -->
    <el-dialog :title="'修改' + dynamicOrStatic" :visible.sync="editDynamicParamsDialogVisible">
      <el-form :model="editDynamicParamsObj" :rules="editDynamicParamsRules" ref="editDynamicParamsRef">
        <el-form-item :label="dynamicOrStatic" label-width="80px" prop="attr_name">
          <el-input v-model="editDynamicParamsObj.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDynamicParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDynamicParamsDialogSure">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 已选中的 id 数组
      selectedIdList: [],
      // 父级分类数据列表
      parentCateList: [],
      // 父级分类 props
      parentProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // tab栏默认选中的项
      activeName: 'many',
      // 控制添加参数按钮的可编辑与否,默认为true,即是不可编辑
      addParamsBtnVisible: true,
      // 参数表格中的数据(从后台接口保存到的)
      paramsTableData: [],
      // 根据 id 获取到的参数
      gotParamsById: [],
      // 控制添加动态参数/静态属性的显示与隐藏
      addDynamicParamsDialogVisible: false,
      // 保存添加动态参数/静态属性弹框中表单数据的对象
      addDynamicParamsObj: {
        attr_name: ''
      },
      // 添加动态参数表单的验证规则对象
      addDynamicParamsRules: {
        // 验证分类名称
        attr_name: [
          { required: true, message: '请输入动态参数', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
        ]
      },
      // 控制修改动态参数/静态属性的显示与隐藏
      editDynamicParamsDialogVisible: false,
      // 保存修改动态参数/静态属性弹框中表单数据的对象
      // 保存后台接口请求到的修改动态参数/静态属性的名称,然后渲染到弹框的表单中
      editDynamicParamsObj: {
        attr_name: ''
      },
      // 修改动态参数表单的验证规则对象
      editDynamicParamsRules: {
        // 验证分类名称
        attr_name: [
          { required: true, message: '请输入动态参数/静态属性', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
        ]
      },
      // 保存当前属性的 id
      attrId: ''
      // 控制 New tag 标签输入框状态
      // inputVisible: false,
      // New tag 标签输入框的值
      // inputValue: ''
    }
  },
  created () {
    // 请求父级分类数据,保存到 parentCateList
    this.getParentCateList()
  },
  computed: {
    // 控制弹框的标题和 label 文本,动态参数/静态属性
    dynamicOrStatic () {
      if (this.activeName === 'many') return '动态参数'
      return '静态属性'
    }
  },
  methods: {
    // 请求父级分类数据
    async getParentCateList () {
      // 请求体不加参数,默认请求三级父级分类数据
      const { data: res } = await this.$http.get('categories')
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('请求父级分类数据失败！')
      }
      // this.$message.success('请求父级分类数据成功！')
      this.parentCateList = res.data
      console.log(res.data)
    },
    // 级联选择器中的选项发生改变,变化后的 id 数组
    // 将自动同步到 v-model 绑定的数组中
    goodsCateItemChange () {},
    // 获取参数列表(动态和静态)
    async getParamsList (id) {
      const { data: res } = await this.$http.get('categories/' + id + '/attributes', {
        params: {
          sel: this.activeName
        }
      })
      console.log(res)
      if (res.meta.status !== 200) {
        // this.$message.error('请求参数列表失败!')
        return
      }
      // this.$message.success('请求参数列表成功!')

      // 将 paramsTableData 中每一项的 attr_vals 属性从字符串变为数组
      res.data.forEach(item => {
        // 为每一个参数项添加 key,以单独触发 New Tag 被点击
        item.inputVisible = false
        item.inputValue = ''
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : ''
      })
      this.paramsTableData = res.data
    },
    // 级联选择器中选项发生变化触发
    goodsParamsItemChange () {
      console.log(this.selectedIdList)
      // 如果选中的是三级分类
      if (this.selectedIdList.length === 3) {
        // 添加参数按钮变为可编辑状态
        this.addParamsBtnVisible = false
        // 获取参数列表,函数中参数为 selectedIdList 数组中的最后一项
        this.getParamsList(this.selectedIdList[this.selectedIdList.length - 1])
        // this.getParamsById(6, 3077)
      } else {
        // 如果选中的不是三级分类
        // 添加参数按钮变为不可点击状态
        this.addParamsBtnVisible = true
      }
    },
    // tab栏切换时触发
    handleTabClick (tab, event) {
      // console.log(tab, event)
      // 改变 activeName 的值
      this.activeName = tab.name
      // 获取参数列表,函数中参数为 selectedIdList 数组中的最后一项
      this.getParamsList(this.selectedIdList[this.selectedIdList.length - 1])
    },
    // 根据 id 查询参数(展示为许多tab标签)
    async getParamsById (id, attrId) {
      const { data: res } = await this.$http.get('categories/' + id + '/attributes/' + attrId, {
        params: {
          attr_sel: this.activeName
        }
      })
      if (res.meta.status !== 200) return this.$message.error('根据 id 查询参数失败!')
      console.log(res)
      this.editDynamicParamsObj = res.data
      // console.log(this.gotParamsById.attr_vals)
      // 将 gotParamsById 中的 attr_vals 属性从字符串变为数组
      // this.gotParamsById.attr_vals = this.gotParamsById.attr_vals.split(' ')
      // console.log(this.gotParamsById.attr_vals)
    },
    // 按下添加动态参数按钮
    addDynamicParams () {
      // 显示弹框
      this.addDynamicParamsDialogVisible = true
    },
    // 按下添加动态参数弹框中的确定按钮
    addDynamicParamsDialogSure () {
      // 表单的预校验
      this.$refs.addDynamicParamsRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories/' + this.selectedIdList[this.selectedIdList.length - 1] + '/attributes', {
          attr_name: this.addDynamicParamsObj.attr_name,
          attr_sel: this.activeName
        })
        console.log(res)
        if (res.meta.status !== 201) return this.$message.error('添加动态参数失败!')
        // 让添加动态参数弹框隐藏
        this.addDynamicParamsDialogVisible = false
        this.$message.success('添加动态参数成功!')
        // 获取最新参数列表(动态和静态)
        this.getParamsList(this.selectedIdList[this.selectedIdList.length - 1])
      })
    },
    // 按下修改动态参数按钮
    editDynamicParams (row) {
      console.log(row)
      this.attrId = row.attr_id
      console.log(this.attrId)
      // 显示弹框
      this.editDynamicParamsDialogVisible = true
      // 根据 id 查询参数
      this.getParamsById(this.selectedIdList[this.selectedIdList.length - 1], row.attr_id)
    },
    // 按下修改动态参数弹框中的确定按钮
    editDynamicParamsDialogSure () {
      // 表单的预校验
      this.$refs.editDynamicParamsRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('categories/' + this.selectedIdList[this.selectedIdList.length - 1] + '/attributes/' + this.attrId, {
          attr_name: this.editDynamicParamsObj.attr_name,
          attr_sel: this.activeName
        })
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error('修改动态参数失败!')
        // 让修改动态参数弹框隐藏
        this.editDynamicParamsDialogVisible = false
        this.$message.success('修改动态参数成功!')
        // 获取最新参数列表(动态和静态)
        this.getParamsList(this.selectedIdList[this.selectedIdList.length - 1])
      })
    },
    // 按下删除属性按钮,根据 id 删除
    async delDynamicParams (row) {
      // 弹出 MessageBox 弹框
      const confirmData = await this.$confirm('此操作将永久删除该属性, 是否继续?', '提示', {
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
      // 执行到这里，代表用户点了确定 categories/:id/attributes/:attrid
      const { data: res } = await this.$http.delete('categories/' + row.cat_id + '/attributes/' + row.attr_id)
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('删除属性失败！')
      this.$message.success('删除属性成功！')
      // 获取最新参数列表(动态和静态)
      this.getParamsList(this.selectedIdList[this.selectedIdList.length - 1])
    },
    // 显示输入框
    showInput (row) {
      row.inputVisible = true
      console.log(row)
      // 让输入框获得焦点
      // $nextTick:当页面被重新渲染之后才会执行回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 按下回车或者输入框失去焦点
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        // 隐藏输入框
        row.inputVisible = false
        return
      }
      // 如果没有return，则证明输入的内容，需要做后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 需要发起请求，保存这次操作
      this.saveAttrVals(row)
    },
    // 将对 attr_vals 的操作，保存到数据库
    async saveAttrVals (row) {
      // 需要发起请求，保存这次操作
      const { data: res } = await this.$http.put(
        `categories/${this.selectedIdList[this.selectedIdList.length - 1]}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )

      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败！')
      }

      this.$message.success('修改参数项成功！')
    },
    // 删除对应的参数可选项
    handleClose (i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  }
}
</script>

<style lang="less" scoped>
.selectGoods {
  margin: 15px 0;
}
.addParams {
  margin-bottom: 15px;
}
.paramsTab {
  margin-right: 15px;
}
.input-new-tag {
  width: 100px;
}
</style>
