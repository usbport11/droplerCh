CKEDITOR.plugins.add( 'dropler', {
    init: function( editor ) {
        backends = {
            basic: {
                upload: uploadBasic,
                required: ['uploadUrl'],
                init: function() {}
            }
        };

        var checkRequirement = function(condition, message) {
            if (!condition)
                throw Error("Assert failed" + (typeof message !== "undefined" ? ": " + message : ""));
        };

        function validateConfig() {
            var errorTemplate = 'DragDropUpload Error: ->';
            checkRequirement(
                editor.config.hasOwnProperty('droplerConfig'),
                errorTemplate + "Missing required droplerConfig in CKEDITOR.config.js"
            );

            var backend = backends[editor.config.droplerConfig.backend];

            var suppliedKeys = Object.keys(editor.config.droplerConfig.settings);
            var requiredKeys = backend.required;

            var missing = requiredKeys.filter(function(key) {
                return suppliedKeys.indexOf(key) < 0
            });

            if (missing.length > 0) {
                throw 'Invalid Config: Missing required keys: ' + missing.join(', ')
            }
        }

        validateConfig();

        var backend = backends[editor.config.droplerConfig.backend];
        backend.init();

        function doNothing(e) { }
		function orPopError(err) { alert("Error while add link in editor: " + err.error) }
		
        function dropHandler(e) {
			console.log('drop handler!');
            e.preventDefault();
            var file = e.dataTransfer.files[0];
            backend.upload(file).then(insertImage, orPopError);
        }
		
		function insertImage(href) {
			var elem = editor.document.createElement('img', {
                attributes: {
                    src: href
                }
            });
            editor.insertElement(elem);
        }

        function addHeaders(xhttp, headers) {
            for (var key in headers) {
                if (headers.hasOwnProperty(key)) {
                    xhttp.setRequestHeader(key, headers[key]);
                }
            }
        }

        function post(url, data, headers) {
            return new Promise(function(resolve, reject) {
				console.log("start post!");
				
                var xhttp = new XMLHttpRequest();
				var formData = new FormData();
				var uploadFieldName = 'file';
				var file = data;
				var extension = '';
				
				console.log("check filename!");
				if(file.name) {
					var fileNameMatches = file.name.match(/\.(.+)$/);
					if (fileNameMatches) {
						extension = fileNameMatches[1];
					}
				}
				
				console.log("create remote filename!");
				var remoteFilename = "image-" + Date.now() + "." + extension;
				
				console.log("form append! " + uploadFieldName + " " + file.name + " " + remoteFilename);
				//here there is some prepares for mediawiki api keys
				formData.append(uploadFieldName, file, remoteFilename);
				formData.append("action", "upload");
				formData.append("token", "will_be_token");//Do not forget in mediawiki usage
				formData.append("format", "json");
				formData.append("filename", file.name);
				
				console.log("xhttp post!");
                xhttp.open('POST', url);

				console.log("xhttp onload!");
				xhttp.onload = function() {
					if (xhttp.status === 200 || xhttp.status === 201) {
						var result = JSON.parse(xhttp.responseText);
						console.log("json parse good!");
						console.log(result);
						resolve(result.link);
					}
					else {
						console.log("json parse error!");
						reject(JSON.parse(xhttp.responseText));
					}
				};
				
				console.log("xhttp send!");
				xhttp.send(formData);
            });
        }

        function uploadBasic(file) {
            var settings = editor.config.droplerConfig.settings;
            return post(settings.uploadUrl, file, settings.headers);
        }

        CKEDITOR.on('instanceReady', function() {
            var iframeBase = document.querySelector('iframe').contentDocument.querySelector('html');
            var iframeBody = iframeBase.querySelector('body');

            iframeBody.ondragover = doNothing;
            iframeBody.ondrop = dropHandler;

            paddingToCenterBody = ((iframeBase.offsetWidth - iframeBody.offsetWidth) / 2) + 'px';
            iframeBase.style.height = '100%';
            iframeBase.style.width = '100%';
            iframeBase.style.overflowX = 'hidden';

            iframeBody.style.height = '100%';
            iframeBody.style.margin = '0';
            iframeBody.style.paddingLeft = paddingToCenterBody;
            iframeBody.style.paddingRight = paddingToCenterBody;
        });
    }
});
