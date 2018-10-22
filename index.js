(function(jq) {
	var GitView = function(){
	 this.selectedRepo = "";
	};
	 
	GitView.prototype.init = function() {
		this.bindings();
	};

	GitView.prototype.loadRepositories = function() {
		//make ajax call or get mock data
		var response = repoInfo,
			repoTemplate = jq(jq("#repositoryTemplate").html()),
			repoList = [];
		repoInfo.repos.forEach(function(repo) {
				repoTemplate.find(".repoName").html(repo.name);
				repoTemplate.find(".list-group-item").attr("id", "repo-"+repo.id);
				repoTemplate.find(".issueCount").html(repo.issueCount);
				repoTemplate.find(".createIssue").attr("data-repo", repo.id)
				repoList.push(repoTemplate.html());
		});
		jq("#user-repo-list").html(repoList);
		jq(".user-repositories").show();
		this.bindings();
	};

	GitView.prototype.updateIssueCount = function() {
		var currentRepo = $("#repo-"+this.selectedRepo),
			issueCountContainer = currentRepo.find(".issueCount"),
			updatedCount = parseInt(issueCountContainer.html()) + 1;
			issueCountContainer.html(updatedCount);
			$('#issueFormModal').modal('toggle').find("input").val("");
	};

	GitView.prototype.bindings = function() {
	var self = this;
		jq("#gitSubmit").on("click", function() {
			var username = jq("#login_username").val(),
				repos = jq(".user-repositories");
			username.length > 0 ? self.loadRepositories() : null;
		});

		jq(".createIssue").on("click", function() {
			self.selectedRepo = $(this).data().repo;
		});

		jq("#newIssueSubmit").on("click", function(e) {
			e.stopImmediatePropagation();
			e.preventDefault;
			self.updateIssueCount($(this));
		});
	};

	var gitView = new GitView();
	gitView.init();
})(jQuery);