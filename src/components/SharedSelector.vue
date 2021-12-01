<template>
  <div class="shared-selector" :style="{
    'grid-template-columns': `${new Array(slotsCount).fill('1fr').join(' ')}`
    }">
    <select
      class="select"
      v-for="(slotOptions, index) in slotsOptions"
      :key="index"
      :value="value[index]"
      @change="onValueChange(index, $event.target.value)"
      @keyup.enter="$emit('enter')"
    >
      <option v-for="option in slotOptions" :key="option" :value="option">
        {{ option === null ? "- - -" : option }}
      </option>
    </select>
  </div>
</template>


<script>
export default {
  name: "SharedSelector",
  
  props: {
    value: {
      type: Array,
      default: () => [null, null, null],
    },
    exclusiveOptions: {
      type: Array,
      default: () => [],
    },
    inclusiveOptions: {
      type: Array,
      default: () => [],
    },
  },
  
  data() {
    return {};
  },
  
  computed: {
    slotsCount() {
      return this.value.length;
    },
    slotsOptions() {
      const computed = [];
      for (let i = 0; i < this.slotsCount; ++i)
        computed.push(this.computeOptions(i));
      return computed;
    },
  },
  
  methods: {
    computeOptions(valueIndex) {
      const exclusiveOptions = this.exclusiveOptions.slice();
      for (let i = 0; i < this.value.length; ++i) {
        if (i === valueIndex) continue; // skip the target
        const exclusiveOptionIndex = exclusiveOptions.indexOf(this.value[i]);
        if (exclusiveOptionIndex === -1) continue; // is an inclusive option
        exclusiveOptions.splice(exclusiveOptionIndex, 1);
      }
      return [...this.inclusiveOptions, ...exclusiveOptions];
    },
    onValueChange(valueIndex, selected) {
      const newValue = this.value.slice();
      newValue[valueIndex] = selected;
      this.$emit("input", newValue);
    },
  },
};
</script>

<style lang="sass" scoped>
@use "styles/colors" as colors
@use "styles/positioning" as positioning
@use "styles/resets" as resets

.shared-selector
  display: grid
  grid-template-rows: auto
  justify-content: space-between
  justify-items: stretch
  column-gap: 15px
  row-gap: 20px

  select
    @include resets.reset-input
    width: 100%
    font-weight: 600
    padding: 10px 10px
    cursor: pointer
    color: colors.$jambalaya
    background-color: colors.$soapstone
    border-radius: 8px

</style>