<template>
  <div class="sidebar-logo-container" :class="{'collapse':collapse}">
    <transition name="sidebarLogoFade">
      <router-link v-if="collapse" key="collapse" class="sidebar-logo-link" to="/">
        <img v-if="logo" :src="logo" class="sidebar-logo">
        <h1 v-else class="sidebar-title">{{ title }} </h1>
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/">
        <img v-if="logo" :src="logo" class="sidebar-logo">
        <h1 class="sidebar-title">{{ title }} </h1>
      </router-link>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'SidebarLogo',
  props: {
    collapse: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      title: '数智化液位管理系统',
      logo: require('@/assets/images/aizhishang.png')
    }
  }
}
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 50px;
  background: #2b2f3a;
  overflow: hidden;

  & .sidebar-logo-link {
    height: 100%;
    width: 100%;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: flex-start;
    padding: 0 12px;
    text-decoration: none;
    color: #fff;

    & .sidebar-logo {
      width: 36px;
      height: 36px;
      flex-shrink: 0;
    }

    & .sidebar-title {
      flex: 1;
      min-width: 0;
      margin: 0 0 0 10px;
      padding: 0;
      color: #fff !important;
      font-weight: 600;
      font-size: 14px;
      line-height: 1.3;
      font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
      text-align: left;
      overflow: hidden;
    }
  }

  &.collapse {
    .sidebar-logo-link {
      justify-content: center;
      padding: 0;
    }
    .sidebar-title {
      display: none;
    }
  }
}
</style>
