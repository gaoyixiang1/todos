
window.onload = function () {

    var taskBox = $('#todo-list')
		var taskArr = [];

		$.ajax({
			type: 'get',
			url: '/init',
			success: function (response) {
				taskArr = response;
				render();
				$('#count').text(taskArr.length)
			}
		})

		$('#task').on('keyup', function (event) {
			if (event.keyCode == 13) {
				var taskName = $(this).val();
				if (taskName.trim().length == 0) {
					alert('请输入内容');
					return;
				}
				$.ajax({
					type: 'post',
					url: '/addTask',
					contentType: 'application/json',
					data: JSON.stringify({ title: taskName }),
					success: function (response) {
						taskArr.push(response);
						$('#task').val('')
						render();
						
						location.reload(true)
						$('#count').text(taskArr.length)
					}
				})
			}
		})

		function render() {
			var html = template('taskTpl', {
				tasks: taskArr
			});
			taskBox.html(html)
		}
	
	taskBox.on('click','.destroy',function(){
		var id = $(this).attr('data-id');
		$.ajax({
			type:'get',
			url:'/deleteTask',
			data:{
				id:id
			},
			success:function(response){
				var index = taskArr.findIndex(item=>item.id == id);
				taskArr.splice(index,1)
				render();
				$('#count').text(taskArr.length)
			}
		})
	})


	taskBox.on('change','.toggle',function(){
		
		let status = $(this).is(':checked');
		const id = $(this).siblings('button').attr('data-id');
		var index = taskArr.findIndex(item=>item.id == id);
		if(taskArr[index].completed){
			status = !status;
		}else{
			status = status;
		}
		$.ajax({
			type:'post',
			url:'/changeTask',
			data:JSON.stringify({id:id,completed:status}),
			contentType:'application/json',
			success:function(response){
				var index = taskArr.findIndex(item=>item.id == id);
				taskArr[index].completed = response[0].completed;
				render();
				$('#count').text(taskArr.length)
			}

		})
	})
	
	taskBox.on('dblclick','label',function(){
		$(this).parent().parent().addClass('editing')
		$(this).parent().siblings('input').val($(this).text())
		$(this).parent().siblings('input').focus()
	})
	
	taskBox.on('blur','.edit',function(){
		var newTitle = $(this).val();
		var newId = $(this).siblings().find('button').attr('data-id');
		$.ajax({
			type:'post',
			url:'/changeTask',
			data:JSON.stringify({id:newId,title:newTitle}),
			contentType:'application/json',
			success:function(response){
				var index = taskArr.findIndex(item =>item.id == newId);
				taskArr[index].title = response[0].title;
				render();
			}

		})
	})

	$('#active').on('click',function(){
		var newArr=[]
		for(let i in taskArr){
			if(taskArr[i].completed== ''){
				newArr.push(taskArr[i]);
			}
		}
		var html = template('taskTpl', {
				tasks: newArr
			});
			taskBox.html(html)
			$('#count').text(newArr.length)
	})

	$('#completed').on('click',function(){
		var completedArr=[]
		for(let i in taskArr){
			if(taskArr[i].completed!= ''){
				completedArr.push(taskArr[i]);
			}
		}
		var html = template('taskTpl', {
				tasks: completedArr
			});
			taskBox.html(html)
			$('#count').text(completedArr.length)
	})

	$('#all').on('click',function(){
		var html = template('taskTpl', {
				tasks: taskArr
			});
			taskBox.html(html)
			$('#count').text(taskArr.length)
	})

	$('.clear-completed').on('click',function(){
		$.ajax({
			type:'get',
			url:'/clearAll',
			success:function(response){
				taskArr = response
				render()
				$('#count').text(taskArr.length)
			}
		})
	})


};

