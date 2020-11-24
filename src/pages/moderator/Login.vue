<template>
  <div class="container">
    <form class="form" @submit.prevent>
      <div class="form-title">Sign into your moderator account.</div>
      <div class="form-row" v-if="didFail">
        <div class="error-message">
          You have entered an invalid username or password.
        </div>
      </div>
      <div class="form-row">
        <label for="username" class="input-label">
          Username<span>*</span>
        </label>
        <input
          id="username"
          class="input-username"
          ref="username"
          type="text"
          :value="username"
          @input="onUsernameChange"
          @keyup.enter="onLogIn"
        />
      </div>
      <div class="form-row">
        <label for="password" class="input-label">
          Password<span>*</span>
        </label>
        <input
          id="password"
          class="input-username"
          ref="password"
          type="password"
          :value="password"
          @input="onPasswordChange"
          @keyup.enter="onLogIn"
        />
      </div>
      <div class="form-row submit">
        <div class="button-container">
          <button class="submit-button" type="button" @click="onLogIn">
            Sign in
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from "vuex";

export default {
  name: "ModeratorLogin",
  data: function () {
    return {
      username: "",
      password: "",
      didFail: false,
    };
  },
  computed: {
    ...mapState("profile", {
      usedUsername: "username",
      usedPassword: "password",
    }),
    ...mapGetters("profile", ["isLoggedIn"]),
  },
  methods: {
    ...mapActions("profile", ["logIn"]),
    onUsernameChange: function (event) {
      const username = event.target.value;
      this.username = username;
      this.didFail = false;
    },
    onPasswordChange: function (event) {
      const password = event.target.value;
      this.password = password;
      this.didFail = false;
    },
    // refocuses if one field is missing, submit with all fields
    onLogIn: async function () {
      const { username, password, $refs } = this;
      if (username.length <= 0) {
        $refs.username.focus();
        return;
      }
      if (password.length <= 0) {
        $refs.password.focus();
        return;
      }
      await this.logIn({ username, password });
      if (!this.isLoggedIn) this.didFail = true;
      else this.$emit("redirect");
    },
  },
  mounted: function () {
    // only restores on success, handles back navigation edge case
    this.username = this.usedUsername;
    this.password = this.usedPassword;
  },
};
</script>


<style lang="scss" scoped>
.container {
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  color: #7e7261;
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
  &.submit {
    margin-top: 24px;
    text-align: center;
  }
}

.error-message {
  color: rgb(244, 72, 72);
  background-color: rgb(254, 245, 245);
  padding: 10px 16px;
  font-size: 0.875rem;
  border-radius: 5px;
  border-width: 1px;
  border-style: solid;
  border-color: rgb(244, 72, 72);
}

.input-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 700;
  width: 100px;

  &:hover {
    cursor: pointer;
  }

  span {
    color: #00b6a7;
  }
}

.input-username,
.input-password {
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
  border-color: #7e7261;
  background-color: transparent;
  color: inherit;

  &:focus {
    outline: none;
  }
}

/* need this for animation */
.button-container {
  background-color: #00b6a7;
  padding: 3px;
  border-radius: 5px;
}

.submit-button {
  font-weight: 700;
  width: 100%;
  display: inline-block;
  font-family: inherit;
  text-align: center;
  background-color: #00b6a7;
  color: #ffffff;
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