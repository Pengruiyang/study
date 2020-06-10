# 什么是盒模型,如何进行不同盒模型切换?
标准盒模型 content-box width = content
ie 盒模型 border-box width = content + padding
# 相邻兄弟选择器
  img + p
# position 属性 区别
  sticky 粘性布局  在屏幕中 relation ,外 fixed
# 移动端适配方案
 rem vwvh @media 媒介查询 flex
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
