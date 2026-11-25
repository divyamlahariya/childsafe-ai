



let model;

const modelURL = "./frontend/trained%20model/model.json";
const metadataURL = "./frontend/trained%20model/metadata.json";


// 2. Get HTML Elements

const imageUpload = document.getElementById("imageUpload");
const preview = document.getElementById("preview");
const analyseButton = document.getElementById("analyseButton");

const status = document.getElementById("status");
const resultMessage = document.getElementById("resultMessage");
const finalResult = document.getElementById("finalResult");


// 3. Load AI Model

async function loadModel() {

    try {

        status.innerText = "Loading AI model...";

        model = await tmImage.load(
            modelURL,
            metadataURL
        );

        status.innerText = "AI model loaded successfully!";

        if (imageUpload.files.length > 0) {
            analyseButton.disabled = false;
        }

        console.log("Model loaded successfully");

    }

    catch (error) {

        status.innerText = "Model could not be loaded. Check your model files.";

        console.error(error);

    }

}

loadModel();


// 4. Upload and Preview Image

imageUpload.addEventListener("change", function(event) {

    const file = event.target.files[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {
        status.innerText = "Please select a valid image.";
        return;
    }

    preview.src = URL.createObjectURL(file);

    preview.onload = function() {

        preview.style.display = "block";

        document.getElementById("imageMessage").innerText =
            "Image uploaded successfully.";

        analyseButton.disabled = !model;

        resultMessage.innerText =
            "Image ready for analysis.";

        finalResult.innerText =
            "Click Analyse Image to see the results.";

    };

});


// 5. Analyse Image

async function analyseImage() {

    if (!model) {

        status.innerText = "Please wait for the model to load.";

        return;

    }

    if (!imageUpload.files.length || !preview.complete ||
        !preview.naturalWidth) {

        status.innerText = "Please upload an image first.";

        return;

    }

    try {

        analyseButton.disabled = true;

        status.innerText = "Analysing image...";

        resultMessage.innerText = "Processing...";

        // Send image to trained model

        const predictions = await model.predict(preview);


        // Find the two required categories

        const bullying = predictions.find(item =>
            item.className.toLowerCase().includes("bully")
        );

        const violence = predictions.find(item => {

            const name = item.className.toLowerCase();

            return name.includes("violent") ||
                   name.includes("violence");

        });


        // Check whether both categories exist

        if (!bullying || !violence) {

            throw new Error(
                "Could not find both Bullying and Violent classes. Check your model's class names."
            );

        }


        // Convert scores into percentages

        const bullyingPercent =
            bullying.probability * 100;

        const violencePercent =
            violence.probability * 100;


        // Display percentages

        document.getElementById("bullyingScore").innerText =
            bullyingPercent.toFixed(2) + "%";

        document.getElementById("violenceScore").innerText =
            violencePercent.toFixed(2) + "%";


        // Update progress bars

        document.getElementById("bullyingBar").style.width =
            bullyingPercent + "%";

        document.getElementById("violenceBar").style.width =
            violencePercent + "%";


        // Display higher scoring category

        if (bullyingPercent > violencePercent) {

            finalResult.innerText =
                "Higher model score: Bullying-related visual content.";

        }

        else if (violencePercent > bullyingPercent) {

            finalResult.innerText =
                "Higher model score: Violent game content.";

        }

        else {

            finalResult.innerText =
                "Both categories have equal model scores.";

        }


        resultMessage.innerText =
            "Image analysis completed successfully.";

        status.innerText = "Analysis completed!";

    }

    catch (error) {

        status.innerText = "Analysis could not be completed.";

        resultMessage.innerText = error.message;

        console.error(error);

    }

    finally {

        analyseButton.disabled = false;

    }

}


// 6. Connect Button

analyseButton.addEventListener("click", analyseImage);
