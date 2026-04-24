import { createApp } from 'vue'
import { Button, Cell, Icon, Loading, Notify, Locale } from 'vant'
import zhCN from 'vant/es/locale/lang/zh-CN'
import 'vant/lib/index.css'

Locale.use('zh-CN', zhCN)
import 'animate.css'
import './style.css'
import App from './App.vue'

const app = createApp(App)
app.use(Button)
app.use(Cell)
app.use(Icon)
app.use(Loading)
app.use(Notify)
app.mount('#app')
