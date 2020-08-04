<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片式视图区域 -->
    <el-card>
      <!-- 首行，搜索框、搜索按钮和添加用户按钮 -->
      <el-row :gutter="20" class="firstRow">
        <el-col :span="6">
          <el-input placeholder="请输入内容" clearable v-model="searchInput" @change="getUserList">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="18">
          <el-button type="primary" @click="addUser">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 非首行，用户列表表格区域 -->
      <el-table
        :data="userList"
        border
        style="width: 100%">
        <el-table-column
          type="index"
          label="#">
        </el-table-column>
        <el-table-column
          prop="username"
          label="姓名"
          width="180">
        </el-table-column>
        <el-table-column
          prop="email"
          label="邮箱"
          width="180">
        </el-table-column>
        <el-table-column
          prop="mobile"
          label="电话"
          width="180">
        </el-table-column>
        <el-table-column
          prop="role_name"
          label="角色"
          width="180">
        </el-table-column>
        <el-table-column
          label="状态"
          width="180">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <el-switch
            v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
          </el-switch>
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          label="操作"
          width="214">
          <template slot-scope="scope">
            <!-- 编辑用户按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editUser(scope.row.id)"></el-button>
            <!-- 删除用户按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="delUser(scope.row.id)"></el-button>
            <!-- 设置角色权限 -->
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button  on type="warning" icon="el-icon-setting" size="mini" @click="assignRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 完整分页布局 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[1, 2, 3, 5]"
        :page-size="pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalPage">
      </el-pagination>
    </el-card>
    <!-- 添加用户 弹框 -->
    <el-dialog title="添加用户" :visible.sync="addUserDialogVisible">
      <el-form :model="addUserObj" :rules="addUserRules" ref="addUserRef">
        <el-form-item label="用户名" label-width="80px" prop="username">
          <el-input v-model="addUserObj.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" label-width="80px" prop="password">
          <el-input v-model="addUserObj.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" label-width="80px" prop="email">
          <el-input v-model="addUserObj.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" label-width="80px" prop="mobile">
          <el-input v-model="addUserObj.mobile"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUserDialogSure">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 编辑用户 弹框 -->
    <el-dialog title="修改用户信息" :visible.sync="editUserDialogVisible">
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
    </el-dialog>
    <!-- 分配角色 弹框 -->
    <el-dialog title="分配角色" :visible.sync="assignRoleDialogVisible">
      <p>当前的用户：{{editUserObj.username}}</p>
      <p>当前的角色：{{roleObj.roleName}}</p>
      <el-form :model="assignRoleObj" ref="assignRoleRef">
        <el-form-item label="分配新角色">
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option :label="item.roleName" :value="item.id" v-for="item in roleList" :key="item.id"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="assignRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="assignRoleDialogSure">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    // 自定义邮箱验证规则
    var validateEmail = (rule, value, callback) => {
      // 邮箱正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        // 合法邮箱
        callback()
        return
      }
      callback(new Error('请输入合法的邮箱！'))
    }
    // 自定义手机号验证规则
    var validateMobile = (rule, value, callback) => {
      // 手机号正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        // 合法手机号
        callback()
        return
      }
      callback(new Error('请输入合法的手机号！'))
    }
    return {
      // 用户列表
      userList: [],
      // 总共页数
      totalPage: null,
      // 当前页
      currentPage: 1,
      // 一页展示数据条数
      pagesize: 2,
      // 搜索输入框的值
      searchInput: '',
      // 控制添加用户弹框是否显示
      addUserDialogVisible: false,
      addUserObj: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 表单的验证规则对象
      addUserRules: {
        // 验证用户名
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' }
        ],
        // 验证密码
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
        ],
        // 验证邮箱，其中用到自定义验证规则
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: validateEmail, trigger: 'blur' }
        ],
        // 验证手机号，其中用到自定义验证规则
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: validateMobile, trigger: 'blur' }
        ]
      },
      // 控制编辑用户弹框是否显示
      editUserDialogVisible: false,
      // 保存从服务器查询到的编辑用户数据
      editUserObj: {
        username: '',
        email: '',
        mobile: ''
      },
      // 表单的验证规则对象
      editUserRules: {
        // 验证邮箱，其中用到自定义验证规则
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: validateEmail, trigger: 'blur' }
        ],
        // 验证手机号，其中用到自定义验证规则
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: validateMobile, trigger: 'blur' }
        ]
      },
      // 控制分配角色弹框是否显示
      assignRoleDialogVisible: false,
      assignRoleObj: {
        username: '',
        roleName: ''
      },
      // 角色对象（一个角色）
      roleObj: {},
      // 角色列表（所有角色）
      roleList: {},
      // 已选角色 id
      selectedRoleId: ''
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    // 获取用户列表
    async getUserList () {
      const { data: res } = await this.$http.get('users', {
        params: {
          query: this.searchInput,
          pagenum: this.currentPage,
          pagesize: this.pagesize
        }
      })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('请求数据失败！')
      }
      // this.$message.success('请求数据成功！')
      this.userList = res.data.users
      this.totalPage = res.data.total
    },
    // 页码大小改变
    handleSizeChange (val) {
      // console.log(`每页 ${val} 条`)
      this.pagesize = val
      this.getUserList()
    },
    // 当前页码改变
    handleCurrentChange (val) {
      // console.log(`当前页: ${val}`)
      this.currentPage = val
      this.getUserList()
    },
    // 搜索框失去焦点或按下回车触发的事件
    searchChange () {

    },
    // 按下添加用户按钮
    addUser () {
      this.addUserDialogVisible = true
    },
    // 按下添加用户弹框的确定按钮
    addUserDialogSure () {
      // 表单预检验
      this.$refs.addUserRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('users', this.addUserObj)
        // console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败！')
        }
        this.$message.success('添加用户成功！')
        // 让添加用户弹框隐藏
        this.addUserDialogVisible = false
        // 清空表单
        this.$refs.addUserRef.resetFields()
      })
    },
    // 按下编辑用户信息按钮
    async editUser (id) {
      // 显示编辑用户信息弹框
      this.editUserDialogVisible = true
      // 根据 id 查询用户信息，保存到 editUserObj，用于渲染到编辑用户信息弹框
      const { data: res } = await this.$http.get('users/' + id)
      // console.log(res)
      if (res.meta.status !== 200) return
      this.editUserObj = res.data
      // console.log(this.editUserObj)
    },
    // 按下编辑用户弹框的确定按钮
    async editUserDialogSure () {
      // 表单预检验
      this.$refs.editUserRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('users/' + this.editUserObj.id, {
          email: this.editUserObj.email,
          mobile: this.editUserObj.mobile
        })
        // console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('修改用户信息失败！')
        }
        this.$message.success('修改用户信息成功！')
        // 让修改用户弹框隐藏
        this.editUserDialogVisible = false
        // 清空表单
        // this.$refs.editUserRef.resetFields()
        // 刷新用户列表
        this.getUserList()
      })
    },
    // 根据 id 删除用户
    async delUser (id) {
      // 弹出 MessageBox 弹框
      const confirmData = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
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
      const { data: res } = await this.$http.delete('users/' + id)
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('删除用户失败！')
      this.$message.success('删除用户成功！')
      this.getUserList()
    },
    // 按下分配角色按钮
    // info：当前所在行的数据
    async assignRole (info) {
      this.assignRoleDialogVisible = true
      this.roleObj = {}
      // 根据用户 id 查询用户信息，保存到 editUserObj，用于渲染到编辑用户信息弹框
      const { data: res } = await this.$http.get('users/' + info.id)
      // console.log(res)
      if (res.meta.status !== 200) return
      this.editUserObj = res.data
      // 根据角色 id 查询角色
      const { data: roleRes } = await this.$http.get('roles/' + res.data.rid)
      // console.log(roleRes)
      if (roleRes.meta.status !== 200) return
      // 保存到角色对象 roleObj
      this.roleObj = roleRes.data
      // 获取角色列表
      const { data: roleListRes } = await this.$http.get('roles')
      // console.log(roleListRes)
      if (res.meta.status !== 200) {
        return this.$message.error('请求数据失败！')
      }
      // this.$message.success('请求数据成功！')
      this.roleList = roleListRes.data
    },
    // 按下分配角色弹框的确定按钮
    async assignRoleDialogSure () {
      const { data: res } = await this.$http.put('users/' + this.editUserObj.id + '/role', {
        rid: this.selectedRoleId
      })
      // console.log(res.data)
      if (res.meta.status !== 200) return this.$message.error('分配角色失败！')
      this.$message.success('分配角色成功！')
      // 隐藏分配角色弹框
      this.assignRoleDialogVisible = false
      // 刷新用户列表
      this.getUserList()
    },
    async userStateChanged (userInfo) {
      const { data: res } = await this.$http.put('users/' + userInfo.id + '/state/' + userInfo.mg_state)
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('状态修改失败！')
      this.$message.success('状态修改成功！')
    }
  }
}
</script>

<style lang="less" scoped>
.firstRow {
  margin-bottom: 15px;
}
</style>
