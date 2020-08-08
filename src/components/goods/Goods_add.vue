<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 首行，搜索框、搜索按钮和添加商品按钮 -->
      <el-row class="firstRow">
        <el-col>
          <el-alert
            title="添加商品信息"
            type="info"
            center
            show-icon
            :closable="false">
          </el-alert>
        </el-col>
      </el-row>
      <!-- 非首行，step 步骤条区域 -->
      <el-steps :active="activeStep - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 居左 tabs 标签页区域(el-form包裹) -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs tab-position="left" @tab-click="tabClick" v-model="activeStep" :before-leave="beforeTabLeave">
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类">
              <!-- 级联选择器 -->
              <!-- v-model 已选中的 id 数组 -->
              <!-- options 数据源 -->
              <!-- props 配置选项 -->
              <el-cascader
                v-model="selectedIdList"
                :options="parentCateList"
                :props="parentProps"
                @change="goodsParamsItemChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品参数 -->
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyParamsData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border :label="subItem" v-for="(subItem, i) in item.attr_vals" :key="i"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品属性 -->
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyAttrData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品图片 -->
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :headers="uploadHeaders"
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              list-type="picture">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <!-- 商品内容 -->
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce" />
            <el-button class="addGoodsbtn" type="primary" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览的弹框 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewPicDialogVisible"
      width="50%">
      <img :src="this.picUrl" alt="">
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 激活的 step,默认为第一个
      activeStep: 0,
      // 添加商品的数据对象
      addForm: {
        goods_name: '',
        goods_price: '0',
        goods_number: '0',
        goods_weight: '0',
        goods_cat: '',
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      // 表单的验证规则
      addFormRules: {
        // 验证商品名称
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ]
      },
      // 父级分类数据列表
      parentCateList: [],
      // 父级分类 props
      parentProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 已选择的父级分类 id 数组
      selectedIdList: [],
      // 动态参数数据数组
      manyParamsData: [],
      // 静态属性数据数组
      onlyAttrData: [],
      // 为上传图片的请求头添加 Authorization 属性
      uploadHeaders: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 上传图片用到的临时对象
      tempObj: {
        pic: ''
      },
      // 控制图片预览弹框的显示与隐藏
      previewPicDialogVisible: false,
      // 图片完成 url
      picUrl: ''
    }
  },
  created () {
    this.getParentCateList()
  },
  methods: {
    // tab 被选中时触发
    tabClick (val, a) {
    },
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
      // console.log(res.data)
    },
    // 级联选择器中选项发生变化触发
    goodsParamsItemChange () {
      // console.log(this.selectedIdList)
      // 如果选中的是三级分类
      if (this.selectedIdList.length === 3) {
      } else {
      }
    },
    // tab 切换时触发
    // oldActiveName: 将要离开的 tab
    // activeName: 即将进入的 tab
    // return false 将阻止本次 tab 切换
    beforeTabLeave (activeName, oldActiveName) {
      // console.log(activeName)
      // console.log(oldActiveName)
      // 如果要离开基本信息 tab,必须先选择一个三级分类
      if (oldActiveName === '0' && this.selectedIdList.length !== 3) {
        this.$message.error('请先选择正确的商品分类!')
        return false
      } else if (activeName === '1') {
        // 如果要进入商品参数 tab,则请求动态参数数据
        this.getManyParamsData(this.selectedIdList[this.selectedIdList.length - 1])
      } else if (activeName === '2') {
        // 如果要进入商品属性 tab,则请求静态属性数据
        this.getOnlyAttrData(this.selectedIdList[this.selectedIdList.length - 1])
      }
    },
    // 获取动态参数数据
    async getManyParamsData (id) {
      const { data: res } = await this.$http.get('categories/' + id + '/attributes', {
        params: {
          sel: 'many'
        }
      })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取动态参数数据失败!')
      // 先把 res.data 中每一项中的 attr_vals 变为数组(原本是字符串,以空格分隔开)
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals.split(' ')
      })
      this.manyParamsData = res.data
    },
    // 获取静态属性数据
    async getOnlyAttrData (id) {
      const { data: res } = await this.$http.get('categories/' + id + '/attributes', {
        params: {
          sel: 'only'
        }
      })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取静态属性数据失败!')
      this.onlyAttrData = res.data
    },
    // 处理图片预览
    handlePreview (file) {
      console.log(file)
      // 显示图片预览弹框
      this.previewPicDialogVisible = true
      this.picUrl = file.response.data.url
    },
    // 处理图片移除
    handleRemove (file) {
      console.log(file)
      // 找到该图片在 pics 数组中的索引值
      const i = this.addForm.pics.findIndex(item => {
        return item.pic === file.response.data.tem_path
      })
      // console.log(i)
      // 根据索引值,移除 pics 数组中的对应项
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm)
    },
    // 处理图片上传成功
    // res: 服务器返回的数据
    handleSuccess (res) {
      // console.log(res)
      // 将返回数据中的图片临时路径保存到 tempObj 的 tmp_path 字段中
      this.tempObj.tmp_path = res.data.tmp_path
      // 将 tempObj push 到 addForm 的 pics 数组中
      this.addForm.pics.push(this.tempObj)
      // console.log(this.addForm)
    },
    // 按下添加商品按钮 触发
    addGoods () {
      // 将 goods_cat 处理成以逗号分割的字符串
      this.addForm.goods_cat = this.selectedIdList.join(',')
      // console.log(this.manyParamsData)
      // console.log(this.onlyAttrData)
      this.manyParamsData.forEach(item => {
        var tempObj = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals.join(' ')
        }
        this.addForm.attrs.push(tempObj)
      })
      // 将数组 onlyAttrData 中的每一个对象都添加到数组 attrs 中
      this.onlyAttrData.forEach(item => {
        var tempObj = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals
        }
        this.addForm.attrs.push(tempObj)
      })
      // console.log(this.addForm)
      // 表单预检验
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写必要的表单项!')
        const { data: res } = await this.$http.post('goods', this.addForm)
        console.log(res)
        if (res.meta.status !== 201) return this.$message.error('添加商品失败!')
        this.$message.success('添加商品成功!')
        // 编程式导航,跳转回商品列表页面
        this.$router.push('/goods')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-steps {
  margin: 15px 0;
}
// 直接修改看不到效果,!important也看不到
// 谷歌一下发现在类名前面加/deep/可以解决
/deep/ .el-step__title {
  font-size: 13px;
}
.el-checkbox {
  margin-left: 0 !important;
  margin-right: 10px;
}
.el-dialog img {
  width: 100%;
}
// 直接修改看不到效果,!important也看不到
// 谷歌一下发现在类名前面加/deep/可以解决
/deep/ .ql-editor {
  min-height: 300px;
}
.addGoodsbtn {
  margin-top: 15px;
}
</style>
