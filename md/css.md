# 什么是盒模型,如何进行不同盒模型切换?
标准盒模型 content-box width = content
ie 盒模型 border-box width = content + padding
# 相邻兄弟选择器
  img + p
# position 属性 区别
  sticky 粘性布局  在屏幕中 relation ,外 fixed
# 移动端适配方案
 rem vw vh @media 媒介查询 flex
flexible: 通过 js 控制 viewport 能力,使用 rem 模拟 vw 特性. 控制 viewport 的 width 和 scale 的值适配高倍屏展示.实现 1 物理像素 = 1 css 像素
#  align-items 和 align-content 的区别
align-items 针对每一个 flex 子项起作用
align-content 将每一行 flex 子项看成一个最小单位.在 flex 子项多行 flex 容器高度固定情况下生效.子项当行需要 flex 容器高度固定且设置了 flex-wrap:wrap
# flex属性
## 父元素上
display: flex; 定义 一个 flex 容器
flex-direction: row; 主轴方向
flex-wrap:  换行
justify-content: 在主轴(横轴)方向上对齐方式
align-items: 在侧轴(纵轴)方向上对齐方式
align-content 各行向弹性盒容器伸缩行的对齐方式
## 子元素上
flex-grow: 扩展比例,根据扩展比例分配剩余空间
flex-shrink 收缩比例,根据收缩比例收缩空间
flex-basis: 伸缩基准值 所有子元素基准值之和大于剩余空间,根据每项的基准值按比例伸缩剩余空间
flex: 0 1 auto
align-self: 纵轴对齐方式 可以覆盖父容器的 align-items
# flex 主轴
flex-direction: 主轴方向 row:横轴 column:纵轴
# 清除浮动原理
形成 BFC 块级格式上下文.
BFC: 一个独立的渲染区域,规定了内部布局,并且与外部毫不相干.
触发条件:
  float 除了none以外的值 
  overflow 除了visible 以外的值（hidden，auto，scroll ） 
  display (table-cell，table-caption，inline-block) 
  position（absolute，fixed） 
  fieldset元素


