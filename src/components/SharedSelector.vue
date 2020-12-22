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
import { computed } from "@vue/composition-api";

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
  
  setup(props, context) {
    const slotsCount = computed(() => {
      return props.value.length;
    });
    
    const computeOptions = (valueIndex) => {
      const exclusiveOptions = props.exclusiveOptions.slice();
      for (let i = 0; i < props.value.length; ++i) {
        if (i === valueIndex) continue; // skip the target
        const exclusiveOptionIndex = exclusiveOptions.indexOf(props.value[i]);
        if (exclusiveOptionIndex === -1) continue; // is an inclusive option
        exclusiveOptions.splice(exclusiveOptionIndex, 1);
      }
      return [...props.inclusiveOptions, ...exclusiveOptions];
    };

    const slotsOptions = computed(() => {
      const computed = [];
      for (let i = 0; i < slotsCount.value; ++i) {
        computed.push(computeOptions(i));
      }
      return computed;
    });
    
    const onValueChange = (valueIndex, selected) => {
      const newValue = props.value.slice();
      newValue[valueIndex] = selected;
      context.emit("input", newValue);
    };
    
    return {
      onValueChange,
      slotsOptions,
      slotsCount,
    };
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