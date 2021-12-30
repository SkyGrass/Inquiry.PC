export default {
  props: {
    parentItem: {
      type: Object,
      default: () => {}
    },
    theme: String,
    iconSize: Number
  },
  computed: {
    parentName() {
      return this.parentItem.name;
    },
    children() {
      return this.parentItem.children.filter(f => f.meta.hideInMenu != true);
    },
    textColor() {
      return this.theme === "dark" ? "#fff" : "#495060";
    }
  }
};
