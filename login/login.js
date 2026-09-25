/* ---------- login / logout ---------- */
function enterApp() {
  $("#login-view").hidden = true;
  $("#app-view").hidden = false;
  $("#who").textContent = session.email;
  $("#role").textContent = ROLE_LABEL[session.role] || session.role;
  $("#add-btn").hidden = !canEdit();
  showView(viewFromHash());
  loadAll();
}

function resetFilters() {
  $("#search").value = "";
  $("#filter-category").value = "";
  $("#filter-stock").value = "";
}

$("#login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("#login-btn");
  $("#login-error").textContent = "";
  btn.disabled = true;
  btn.textContent = "Signing in…";
  try {
    const { data, error } = await db.auth.signInWithPassword({
      email: $("#login-email").value.trim(),
      password: $("#login-password").value,
    });
    if (error) throw error;
    // session = data.session;
    // session = { ...data.session, token: data.session.access_token };
    // After a successful signInWithPassword (and also in your page-load session-restore code):
    const { data: profile, error: profileError } = await db
      .from("profiles")
      .select("role")
      .eq("id", data.session.user.id)
      .single();
    session = {
      ...data.session,
      token: data.session.access_token,
      role: profile?.role || "viewer",
    };
    console.log(profile);
    console.log(data);
    console.log("USER ID:", data.session.user.id);
    console.log("PROFILE:", profile);
    console.log("PROFILE ERROR:", profileError);
    $("#login-password").value = "";
    enterApp();
  } catch (err) {
    $("#login-error").textContent = messageOf(err);
  } finally {
    btn.disabled = false;
    btn.textContent = "Sign in";
  }
});

$("#signout-btn").addEventListener("click", async () => {
  await db.auth.signOut();
  session = null;
  resetFilters();
  $("#sort").value = "name";
  showLogin("");
});
