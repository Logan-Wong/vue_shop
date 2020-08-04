<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>角色管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 首行，搜索框、搜索按钮和添加用户按钮 -->
      <el-row class="firstRow">
        <el-button type="primary" @click="addRole">添加角色</el-button>
      </el-row>
      <!-- 非首行，角色列表表格区域 -->
      <el-table
        :data="rolesList"
        border
        style="width: 100%">
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- 第一层 -->
            <el-row v-for="(item1,i1) in scope.row.children" :key="item1.id" class="preExpandRow centerItem"
            :style="i1 === 0 ? 'border-top: 1px solid #eee;' : ''">
              <el-col :span="5">
                <el-tag class="firstColTag"
                  closable  @close="delRight(scope.row, item1.id)"
                  type="">
                  {{item1.authName}}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <!-- 第二层 -->
                <el-row v-for="(item2,i2) in item1.children" :key="item2.id"
                :style="i2 === 0 ? '' : 'border-top: 1px solid #eee;'" class="centerItem">
                  <el-col :span="6">
                    <el-tag class="firstColTag"
                    closable  @close="delRight(scope.row, item2.id)"
                    type="success">
                      {{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 第三层 -->
                    <el-tag v-for="item3 in item2.children" :key="item3.id"
                    closable @close="delRight(scope.row, item3.id)"
                    class="firstColTag preLastColTag"
                    type="warning">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>
              {{scope.row}}
            </pre> -->
          </template>
        </el-table-column>
        <el-table-column
          type="index"
          label="#"
          width="63">
        </el-table-column>
        <el-table-column
          prop="roleName"
          label="角色名称"
          width="400">
        </el-table-column>
        <el-table-column
          prop="roleDesc"
          label="角色描述"
          width="400">
        </el-table-column>
        <el-table-column
          prop="level"
          label="操作"
          width="400">
          <template slot-scope="scope">
            <!-- 编辑用户按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editRole(scope.row.id)">编辑</el-button>
            <!-- 删除用户按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="delRole(scope.row.id)">删除</el-button>
            <!-- 设置角色权限 -->
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="assignRights(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色 弹框 -->
    <el-dialog title="添加角色" :visible.sync="addRoleDialogVisible">
      <el-form :model="addRoleObj" :rules="addRoleRules" ref="addRoleRef">
        <el-form-item label="角色名称" label-width="80px" prop="roleName">
          <el-input v-model="addRoleObj.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" label-width="80px" prop="roleDesc">
          <el-input v-model="addRoleObj.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoleDialogSure">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 编辑角色 弹框 -->
    <el-dialog title="修改角色信息" :visible.sync="editRoleDialogVisible">
      <el-form :model="editRoleObj" :rules="editRoleRules" ref="editRoleRef">
        <el-form-item label="角色名称" label-width="80px">
          <el-input v-model="editRoleObj.roleName" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色描述" label-width="80px" prop="roleDesc">
          <el-input v-model="editRoleObj.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleDialogSure">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 分配权限 弹框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="assignRightsDialogVisible"
      width="50%" @close="closeAssignRightsDialog">
      <el-tree :data="powerList" :props="treeRightsProps" @node-click="handleNodeClick"
        default-expand-all show-checkbox node-key="id" ref="treeRightsRef"
        :default-checked-keys="curRoleRightsList"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="assignRightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="assignRightsDialogSure()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 角色列表
      rolesList: [],
      // 控制添加角色弹框是否显示
      addRoleDialogVisible: false,
      addRoleObj: {
        roleName: '',
        roleDesc: ''
      },
      // 表单的验证规则对象
      addRoleRules: {
        // 验证角色名称
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        // 验证角色描述
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 2, max: 16, message: '长度在 2 到 16 个字符', trigger: 'blur' }
        ]
      },
      // 控制编辑角色弹框是否显示
      editRoleDialogVisible: false,
      // 保存从服务器查询到的编辑角色数据
      editRoleObj: {
        roleName: '',
        roleDesc: ''
      },
      // 表单的验证规则对象
      editRoleRules: {
        // 验证角色描述
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 2, max: 16, message: '长度在 2 到 16 个字符', trigger: 'blur' }
        ]
      },
      // 控制分配权限弹框是否显示
      assignRightsDialogVisible: false,
      // 权限列表
      powerList: [],
      // 配置 tree 树形控件访问子节点的依据
      treeRightsProps: {
        children: 'children',
        label: 'authName'
      },
      // 当前角色拥有的权限 id 数组
      curRoleRightsList: [],
      // 当前角色信息 scope.row 传过来的
      curRoleInfo: ''
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 获取角色列表
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('请求数据失败！')
      }
      // this.$message.success('请求数据成功！')
      this.rolesList = res.data
    },
    // 添加角色
    addRole () {
      this.addRoleDialogVisible = true
    },
    // 按下添加角色弹框的确定按钮
    addRoleDialogSure () {
      // 表单预检验
      this.$refs.addRoleRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addRoleObj)
        // console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败！')
        }
        this.$message.success('添加角色成功！')
        // 让添加角色弹框隐藏
        this.addRoleDialogVisible = false
        // 清空表单
        this.$refs.addRoleRef.resetFields()
        // 刷新页面
        this.getRolesList()
      })
    },
    // 按下编辑角色信息按钮
    async editRole (id) {
      // 显示编辑角色信息弹框
      this.editRoleDialogVisible = true
      // console.log(id)
      // 根据 id 查询角色信息，保存到 editRoleObj，用于渲染到编辑角色信息弹框
      const { data: res } = await this.$http.get('roles/' + id)
      // console.log(res)
      if (res.meta.status !== 200) return
      this.editRoleObj = res.data
      // console.log(this.editRoleObj)
    },
    // 按下编辑用户弹框的确定按钮
    async editRoleDialogSure () {
      // 表单预检验
      this.$refs.editRoleRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('roles/' + this.editRoleObj.roleId, {
          roleName: this.editRoleObj.roleName,
          roleDesc: this.editRoleObj.roleDesc
        })
        // console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('修改角色信息失败！')
        }
        this.$message.success('修改角色信息成功！')
        // 让修改用户弹框隐藏
        this.editRoleDialogVisible = false
        // 清空表单
        // this.$refs.editUserRef.resetFields()
        // 刷新用户列表
        this.getRolesList()
      })
    },
    // 根据 id 删除角色
    async delRole (id) {
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
      const { data: res } = await this.$http.delete('roles/' + id)
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('删除角色失败！')
      this.$message.success('删除角色成功！')
      this.getRolesList()
    },
    // 删除角色指定权限
    // role：当前角色
    // rightId：权限 id
    async delRight (role, rightId) {
      // 弹出 MessageBox 弹框
      const confirmData = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
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
      const { data: res } = await this.$http.delete('roles/' + role.id + '/rights/' + rightId)
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('删除权限失败！')
      this.$message.success('删除权限成功！')
      // 更新当前行的数据
      role.children = res.data
    },
    // 按下分配权限按钮
    assignRights (info) {
      // 记录当前角色信息
      this.curRoleInfo = info
      // 获取权限列表，保存到 powerList 中
      this.getPowerList()
      // 将当前角色拥有的权限在 tree 树形控件中勾上
      // console.log(info)
      this.getCurRoleRightsId(info, this.curRoleRightsList)
      // console.log(this.curRoleRightsList)
      this.assignRightsDialogVisible = true
    },
    // 获取权限列表
    async getPowerList () {
      const { data: res } = await this.$http.get('rights/tree')
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('请求数据失败！')
      }
      // this.$message.success('请求数据成功！')
      this.powerList = res.data
      // console.log(this.powerList)
    },
    // 递归 获取当前角色三级权限 id，保存到 curRoleRightsList
    // 难点，很容易写错！！
    getCurRoleRightsId (node, arr) {
      // 三级节点，children 属性为空
      if (!node.children) {
        return arr.push(node.id)
      }
      // 不是三级节点
      node.children.forEach(item => this.getCurRoleRightsId(item, arr))
    },
    // 关闭分配权限弹框
    closeAssignRightsDialog () {
      // 清空数组 curRoleRightsList，以免影响其他角色的权限渲染
      this.curRoleRightsList = []
    },
    handleNodeClick (data) {
      // console.log(data)
    },
    // 按下分配权限确定按钮
    async assignRightsDialogSure () {
      // 获取已选中和半选中的节点id，... 为展开语法
      var keys = [
        ...this.$refs.treeRightsRef.getCheckedKeys(),
        ...this.$refs.treeRightsRef.getHalfCheckedKeys()
      ]
      // 以逗号分割数组中 id，形成字符串
      var idStr = keys.join(',')
      const { data: res } = await this.$http.post('roles/' + this.curRoleInfo.id + '/rights', {
        rids: idStr
      })
      if (res.meta.status !== 200) return this.$message.error('分配权限失败！')
      this.$message.success('分配权限成功！')
      // 隐藏分配权限弹框
      this.assignRightsDialogVisible = false
      // 刷新角色列表
      this.getRolesList()
      // console.log(res)
    }
  }
}
</script>

<style lang="less" scoped>
.firstRow {
  margin-bottom: 15px;
}
.preExpandRow {
  border-bottom: 1px solid #eee;
}
.firstColTag {
  margin-bottom: 10px;
  margin-top: 10px;
}
.firstExpandRow {
  border-top: 1px solid #eee;
}
.centerItem {
  display: flex;
  align-items: center;
}
.el-icon-caret-right {
  margin-left: 5px;
}
.preLastColTag {
  margin-right: 10px;
}
</style>
