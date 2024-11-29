document.getElementById('imageInput').addEventListener('change', handleImageUpload);
document.getElementById('quality').addEventListener('input', updateEstimatedSize); // 监听质量变化
document.getElementById('compressButton').addEventListener('click', compressImages);

function handleImageUpload(event) {
    const files = event.target.files;
    if (files.length > 0) {
        let totalOriginalSize = 0;
        for (let file of files) {
            totalOriginalSize += file.size;
        }
        
        // 保存总的原始大小
        document.getElementById('imageInfo').innerText = `已选择 ${files.length} 张图片，总大小: ${(totalOriginalSize / 1024).toFixed(2)} KB`;
        
        // 初次计算预计压缩大小
        updateEstimatedSize();
    }
}

function updateEstimatedSize() {
    const files = document.getElementById('imageInput').files;
    if (files.length === 0) return;

    const quality = parseInt(document.getElementById('quality').value) / 100;
    let totalEstimatedSize = 0;

    for (let file of files) {
        totalEstimatedSize += file.size * quality;
    }
    document.getElementById('estimatedSize').innerText = `预计压缩后总大小: ${(totalEstimatedSize / 1024).toFixed(2)} KB`;
}

function compressImages() {
    const files = document.getElementById('imageInput').files;
    if (files.length === 0) {
        alert('请上传图片');
        return;
    }

    const width = parseInt(document.getElementById('width').value) || 0;
    const height = parseInt(document.getElementById('height').value) || 0;
    const quality = parseInt(document.getElementById('quality').value) / 100;
    const format = document.getElementById('format').value;

    Array.from(files).forEach((file, index) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = function (e) {
            img.onload = function () {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = width || img.width;
                canvas.height = height || img.height;

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                let dataUrl;
                if (format === 'jpg' || format === 'jpeg') {
                    dataUrl = canvas.toDataURL('image/jpeg', quality);
                } else if (format === 'png') {
                    dataUrl = canvas.toDataURL('image/png');
                } else {
                    alert('不支持的格式');
                    return;
                }

                const compressedImage = dataURLToBlob(dataUrl);

                document.getElementById('estimatedSize').innerText = `图片 ${index + 1}/${files.length} 已压缩完成，实际大小: ${(compressedImage.size / 1024).toFixed(2)} KB`;

                const downloadLink = document.createElement('a');
                downloadLink.href = URL.createObjectURL(compressedImage);
                downloadLink.download = `compressed_image_${index + 1}.${format}`;
                downloadLink.style.display = 'none';
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function dataURLToBlob(dataURL) {
    const byteString = atob(dataURL.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
        view[i] = byteString.charCodeAt(i);
    }
    return new Blob([view], { type: `image/${document.getElementById('format').value}` });
}
