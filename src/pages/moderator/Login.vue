<template>
  <div class="container">
    <form class="form" @submit.prevent>
      <div class="form-title">Sign in to your moderator account</div>
      <div class="form-row">
        <label for="username" class="input-label">
          Username<span>*</span>
        </label>
        <input id="username" v-model="username"
          class="input-username"
          ref="username"
          type="text"
          @keyup.enter="submit"
        />
      </div>
      <div class="form-row">
        <label class="input-label">
          Password<span>*</span>
        </label>
        <input v-model="password"
          class="input-username"
          ref="password"
          type="password"
          @keyup.enter="submit"
        />
      </div>
      <div class="form-row">
        <div class="button-container">
          <button class="submit-button" @click="submit">Sign in</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: "ModeratorLogin",
  data: function () {
    return {
      username: "",
      password: "",
    };
  },
  methods: {
    ...mapActions('profile', [
      'logIn',
    ]),
    // refocuses if one field is missing, submit with all fields
    submit: function() {
      const { username, password, $refs } = this;
      if (username.length <= 0) {
        $refs.username.focus();
        return;
      };
      if (password.length <= 0) {
        $refs.password.focus();
        return;
      };
      this.logIn({ username, password });
    }
  },
}
</script>


<style lang="scss" scoped>
.container {
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  color: #7E7261;
  background-color: #fffae5;
}

.form {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.form-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 800;
}

.form-row {
  margin-bottom: 0.5rem;
}

.input-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 700;
  width: 100px;

  span {
    color: #00B6A7;
  }
}

.input-username, .input-password {
  display: block;
  width: 400px;
  height: 48px;
  margin-top: 0.25rem;
  padding: 0px 1rem;
  font-size: 1rem;
  font-family: "Nunito";
  font-weight: 700;
  border-radius: 5px;
  border-width: 2px;
  border-style: solid;
  border-color:#7E7261;
  background-color: transparent;
  color: inherit;

  &:focus {
    outline: none;
  }
}

.form-row:last-child {
  margin-top: 24px;
  text-align: center;
}

.button-container {
  background-color: #00B6A7;
  padding: 3px;
  border-radius: 5px;
}

.submit-button {
  font-weight: 700;
  display: inline-block;
  font-family: inherit;
  text-align: center;
  background-color: #00B6A7;
  color: #FFFFFF;
  box-sizing: border-box;
  padding: 10px 16px;
  font-size: 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    outline: none;
  }
}
</style>