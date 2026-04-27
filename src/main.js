import { createApp } from 'vue'
import { Icon, Locale } from 'vant'
import zhCN from 'vant/es/locale/lang/zh-CN'
import 'vant/lib/index.css'

Locale.use('zh-CN', zhCN)
import 'animate.css'
import './style.css'
import App from './App.vue'

const app = createApp(App)
app.use(Icon)
app.mount('#app')
