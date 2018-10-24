(function(jq) {
	
	var GitView = function(){
	 this.selectedRepo = "";
	 this.authToken = "";
	};
	 
	GitView.prototype.init = function() {
		this.bindings();
	};

	GitView.prototype.service = function(options) {
	$(".loader").show();
	var self = this;
		$.ajax({
			url : options.url,
			data : options.data,
			type : options.type,
			beforeSend: function (xhr) {
    				xhr.setRequestHeader ("Authorization", "Basic " + self.authToken);
			},
			success : options.successCallback,
			complete : options.completeCallback
		});
	};
	GitView.prototype.paintRepositories = function (response) {
		
		var repoTemplate = jq(jq("#repositoryTemplate").html()),
			repoList = [];
		response.forEach(function(repo) {
				repoTemplate.find(".repoName").html(repo.full_name);
				repoTemplate.find(".list-group-item").attr("id", "repo-"+repo.id);
				repoTemplate.find(".issueCount").html(repo.open_issues_count);
				repoTemplate.find(".createIssue").attr("data-repo-id", repo.id).attr("data-repo-name",repo.name).attr("data-user-name", repo.owner.login);
				repoList.push(repoTemplate.html());
		});
		jq("#user-repo-list").html(repoList);
		this.showUserInvalid(false);
		this.bindings();
	};

	GitView.prototype.loadRepositories = function(username) {
		var repoURL = 'https://api.github.com/users/'+username+'/repos';
		var self = this;
		this.service({
			url : repoURL,
			type:"GET",
			successCallback : function(response) {
				$(".loader").hide();
				self.paintRepositories(response);
			}
		});
		
	};

	GitView.prototype.updateIssueCount = function() {
		var currentRepo = $("#repo-"+this.selectedRepo.repoId),
			issueCountContainer = currentRepo.find(".issueCount"),
			updatedCount = parseInt(issueCountContainer.html()) + 1;
			issueCountContainer.html(updatedCount);
	};

	GitView.prototype.showUserInvalid = function(flag) {
		$("#userErrorContainer").toggleClass("hidden",!flag);
		$(".user-repositories").toggleClass("hidden", flag);
	};

	GitView.prototype.createNewIssue = function() {
		var currentRepo = $("#repo-"+this.selectedRepo.repoId),
			self = this;
			issuesURL = "https://api.github.com/repos/"+this.selectedRepo.userName+"/"+this.selectedRepo.repoName+"/issues";
			var formData = {};
			$("#createIssueForm").serializeArray().map(function(x){formData[x.name] = x.value;});
			this.service({
				url:issuesURL,
				data : JSON.stringify(formData),
				type : "POST",
				successCallback : function(response) {
					$("#createIssueForm")[0].reset();
					self.updateIssueCount();
					$('#issueFormModal').modal('toggle');
					$(".loader").hide();
				}
			})
			
	};

	GitView.prototype.getUserInfo = function(username) {
		var userURL = 'https://api.github.com/users/'+username,
			self = this;
			this.service({
				url:userURL,
				type:"GET",
				completeCallback: function(response) {
        				response.responseJSON.message === "Not Found" ? self.showUserInvalid(true) :  self.loadRepositories(username);
        				$(".loader").hide();
     			}
			});
			
	};

	GitView.prototype.bindings = function() {
	var self = this;
		jq("#gitSubmit").on("click", function(e) {
			var username = jq("#login_username").val(),
				password = jq("#login_password").val();
			self.authToken = btoa(username + ":" + password);
			$("#loginForm")[0].reset();
			self.getUserInfo(username);
			e.preventDefault();
		});

		jq(".createIssue").on("click", function() {
			self.selectedRepo = $(this).data();
		});

		jq("#newIssueSubmit").on("click", function(e) {
			e.stopImmediatePropagation();
			self.createNewIssue($(this));
			e.preventDefault();
		});
	};

	var gitView = new GitView();
	gitView.init();
})(jQuery);