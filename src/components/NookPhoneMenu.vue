<template>
  <div class="nook-phone">
    <div class="nook-header">
        <span class="nook-time">{{ time }}</span>
    </div>
    <h2>Main Menu</h2>
    <div class="nook-buttons">

    </div>
  </div>
</template>

<script>
export default {
  name: "NookPhoneMenu",
  data: function() {
    return {
        dateObj: new Date(),
        time: "12:00 PM",
    };
  },
  created() {
      const interval = setInterval(() => this.time = this.dateObj.toLocaleTimeString('en-US', {hour: '2-digit', timeStyle: 'short'}), 1000);
  },
}
</script>

<style lang="scss" scoped>
.nook-phone {
    border-radius: 45px;
    background-color: #FFFAE3;
    color: #7E7261;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 550px;
    width: 320px;
    padding: 20px 25px;
}
.nook-header {
    color: #DCD8CA;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}
.nook-phone h2 {
    margin: 10px 0;
    font-size: 24px;
}
</style>
