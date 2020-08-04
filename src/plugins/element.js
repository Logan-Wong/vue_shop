import Vue from 'vue'
import {
  Button,
  Form,
  FormItem,
  Input,
  Message,
  Header,
  Container,
  Aside,
  Main,
  Menu,
  Submenu,
  MenuItem,
  Breadcrumb,
  BreadcrumbItem,
  Card,
  Row,
  Col,
  Table,
  TableColumn,
  Switch,
  Pagination,
  Tag,
  Dialog,
  MessageBox,
  Tooltip,
  Select,
  Option,
  Tree
} from 'element-ui'
// import TableTree from 'vue-table-with-tree-grid'

// Vue.component(ZkTable.name, TableTree)
Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Header)
Vue.use(Container)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItem)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Row)
Vue.use(Col)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Switch)
Vue.use(Pagination)
Vue.use(Tag)
Vue.use(Dialog)
Vue.use(Tooltip)
Vue.use(Select)
Vue.use(Option)
Vue.use(Tree)
Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm
