// QR code scanner functionality
function domReady(fn) 
{
    // If the document is already loaded, execute the function
    if (
        document.readyState === "complete" ||
        document.readyState === "interactive"
    ) {
        setTimeout(fn, 1000);
    } else {
        // Otherwise, wait until the document is loaded
        document.addEventListener("DOMContentLoaded", fn);
    }
}
// When the document is ready, execute the function
domReady(function () 
{
    // Function to handle QR code scanning
    function onScanSuccess(decodeText, decodeResult) 
    {
        // Handle the decoded text
        document.getElementById("biometric-id").value = decodeText;
        alert("QR code scanned successfully!");
    }
    // when start scanner button is clicked qr code scanner will be displayed
    document.getElementById("start-scanner").addEventListener("click", function() 
    {
        document.getElementById("my-qr-reader").style.display = "block";

        // Create a new instance of the QR code scanner
        let htmlscanner = new Html5QrcodeScanner
        (
            "my-qr-reader",
            { fps: 10, qrbox: 250 }
        );
        // Start scanning
        htmlscanner.render(onScanSuccess);
    });
});
