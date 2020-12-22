<template>
  <input
    type="text"
    :value="value"
    placeholder="- - -"
    @input="$emit('input', $event.target.value)"
    @keyup.enter="$emit('enter')"
  />
</template>

<script>
export default {
  name: "TextInput",

  props: {
    value: {
      type: String,
      default: () => "",
    },
  },
};
</script>

<style lang="sass" scoped>
@use "styles/colors" as colors
@use "styles/resets" as resets

input[type="text"]
  box-sizing: border-box
  @include resets.reset-input
  width: 100%
  color: colors.$jambalaya
  background-color: colors.$soapstone

  padding: 10px 20px
  border-radius: 8px
  font-weight: 600

  &::placeholder
    color: rgba(colors.$jambalaya, 0.5)
</style>