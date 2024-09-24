<template>
  <div class="dashboard-editor-container">
    <div class=" clearfix">
      <img src="@/assets/images/GJ1.png" alt="Background Image" style="width: 100%; height: auto;">
    <!--
      <pan-thumb :image="avatar" style="float: left">
        您的角色:
        <span v-for="item in roles" :key="item" class="pan-info-roles">{{ item }}</span>
      </pan-thumb>
      <github-corner style="position: absolute; top: 0px; border: 0; right: 0;" />
      <div class="info-container">
        <span class="display_name">{{ name }}</span>
        <span style="font-size:20px;padding-top:20px;display:inline-block;">导航栏</span>
      </div>-->
    </div>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'DashboardEditor',
  data() {
    return {
      emptyGif: ''
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'avatar',
      'roles'
    ])
  }
}
</script>

<style lang="scss" scoped>
.full-image {
  width: 100%;               // 宽度填满父容器
  height: 100%;              // 高度填满父容器
  object-fit: cover;         // 保持比例并裁剪
}
</style>>
