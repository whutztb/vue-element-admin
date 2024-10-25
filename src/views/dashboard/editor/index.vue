<template>
  <div class="dashboard-admin-container">
    <div class="image-container">
      <img src="@/assets/images/GJ2.png" alt="Background Image" class="full-image">
    </div>
  </div>
</template>

<style lang="scss" scoped>
.image-container {
  display: flex;            // 使用 Flexbox
  justify-content: center;  // 水平居中
  align-items: center;      // 垂直居中
  width: 100%;              // 可根据需要调整
  max-width: 900px;        // 设置最大宽度
  max-height: 600px;       // 设置最大高度
  overflow: hidden;         // 隐藏超出部分
}

.full-image {
  max-width: 90%;          // 最大宽度为父容器宽度
  max-height: 90%;         // 最大高度为父容器高度
  object-fit: cover;        // 保持比例并裁剪
}
</style>
