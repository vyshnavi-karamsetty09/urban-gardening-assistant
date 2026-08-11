const form = document.getElementById("recommendationForm");

form.addEventListener("submit", async function(event) {

    event.preventDefault();

    const pincode =
        document.getElementById("pincode").value.trim();

    const location =
        document.querySelector(
            'input[name="location"]:checked'
        )?.value;

    const space =
        document.querySelector(
            'input[name="space"]:checked'
        )?.value;

    const sunlight =
        document.querySelector(
            'input[name="sunlight"]:checked'
        )?.value;

    if (!/^[0-9]{6}$/.test(pincode)) {
        alert("Please enter a valid 6-digit pincode.");
        return;
    }

    try {

        const response = await fetch(
            "/recommend",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    pincode: pincode,
                    location: location,
                    space: space,
                    sunlight: sunlight
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Something went wrong."
            );
        }

        console.log("Environment:", data.environment);

        console.log(
            "Recommendations:",
            data.recommendations
        );

        displayResults(data);

    } catch (error) {

        console.error(error);

        alert(error.message);
    }
});


function displayResults(data) {

    console.log(
        "Recommended plants:",
        data.recommendations
    );

    // For now, check the result in browser console.
    // We will connect this to your existing UI next.
}