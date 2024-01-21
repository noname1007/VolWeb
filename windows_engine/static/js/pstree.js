function display_pstree(evidence_id) {
  //First get the data via the API.
  $.ajax({
    type: "GET",
    url: "/api/windows/" + evidence_id + "/pstree/",
    dataType: "json",
    success: function (evidence_data) {
      var process_list = evidence_data.artefacts
      var root = new TreeNode("root");
      $.each(process_list, function (_, node) {
        build_tree(node, root);
      });
      first_process = root.getChildren()[0];
      first_process.toggleSelected();
      display_process_info(first_process.getProcessObject(), evidence_id);
      generate_visualisation(first_process.getProcessObject(), process_list);
      var view = new TreeView(root, "#container");
      view.changeOption("leaf_icon", '<i class="fas fa-microchip"></i>');
      view.changeOption("parent_icon", '<i class="fas fa-microchip"></i>');
      TreeConfig.open_icon = '<i class="fas fa-angle-down"></i>';
      TreeConfig.close_icon = '<i class="fas fa-angle-right"></i>';
      root.changeOption("icon", '<i class="fas fa-code-branch"></i>');
      view.reload();

      function build_tree(node, root) {
        // create node and add to elements
        var newNode = new TreeNode(node.PID + " - " + node.ImageFileName, node);
        // now create links
        if (node.__children) {
          $.each(node.__children, function (_, childNode) {
            build_tree(childNode, newNode);
          });
        }
        newNode.on("click", function (e, node) {
          display_process_info(node.getProcessObject(), evidence_id);
          generate_visualisation(node.getProcessObject(), process_list);
        });
        root.addChild(newNode);
      }
    },
    error: function (xhr, status, error) {
      toastr.error("An error occurred : " + xhr.responseText);
    },
  });
}

function display_process_info(process, evidence_id) {
  $.ajax({
    type: "GET",
    url: "/tasks/windows/tasks/",
    dataType: "json",
    beforeSend: function () {},
    success: function (tasks, status, xhr) {
      $(".card_handles").show();
      $(".loading_handles").hide();
      $(".card_process_dump").show();
      $(".loading_process_dump").hide();

      tasks.forEach(function (task) {
        switch (task.task_name) {
          case "windows_engine.tasks.compute_handles":
            test = task.task_kwargs;
            result = JSON.parse(test.substring(1, test.length - 1));
            if (
              result.pid == process.PID &&
              result.evidence_id == evidence_id &&
              task.status != "SUCCESS" && 
              task.status != "FAILURE"
            ) {
              $(".card_handles").hide();
              $(".loading_handles").show();
            }
            break;
          case "windows_engine.tasks.dump_process_memmap":
            test = task.task_kwargs;
            result = JSON.parse(test.substring(1, test.length - 1));
            if (
              result.pid == process.PID &&
              result.evidence_id == evidence_id &&
              task.status != "SUCCESS" && 
              task.status != "FAILURE"
            ) {
              $(".card_process_dump").hide();
              $(".loading_process_dump").show();
            }
            break;
            
          case "windows_engine.tasks.dump_process_pslist":
            test = task.task_kwargs;
            result = JSON.parse(test.substring(1, test.length - 1));
            if (
              result.pid == process.PID &&
              result.evidence_id == evidence_id &&
              task.status != "SUCCESS" && 
              task.status != "FAILURE"
            ) {
              $(".card_process_dump").hide();
              $(".loading_process_dump").show();
            }
            
            break;       
        }
      });
      $(".process_id").attr("id", process.PID);
      $(".process_title").text(process.ImageFileName);
      $(".p_pid").text(process.PID);
      $(".p_offset").text(process["Offset(V)"]);
      $(".p_threads").text(process.Threads);
      $(".p_handles").text(process.Handles);
      $(".p_session").text(process.SessionId);
      if (process.Wow64 == true) {
        $(".p_wow64").addClass("text-danger");
      } else {
        $(".p_wow64").removeClass("text-danger");
      }
      $(".p_wow64").text(process.Wow64);
      $(".p_ctime").text(process.CreateTime);
      $(".p_etime").text(process.ExitTime);

      display_sessions(evidence_id, process.PID);
      display_cmdline(evidence_id, process.PID);

      var url = "/review/windows/" + evidence_id + "/" + process.PID + "/";
      $(".investigate-btn").attr("href", url);
    },
    complete: function (data) {},
    error: function (xhr, status, error) {
      toastr.error("An error occurred while getting the tasks : " + error);
    },
  });
}
