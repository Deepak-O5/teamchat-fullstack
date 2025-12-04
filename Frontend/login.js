async function login() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Please fill all fields");
        return;
    }

    try {
        const res = await fetch("http://98.80.143.158:5000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            alert("Login successful!");
            window.location.href = "channels.html";
        } else {
            alert(data.msg || "Login failed");
        }

    } catch (err) {
        console.error(err);
        alert("Server error");
    }
}
