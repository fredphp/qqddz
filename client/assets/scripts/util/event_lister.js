// 事件监听器 - Cocos Creator 2.x CommonJS 风格

var eventLister = function(obj){
    var register = {}

    obj.on = function(type, method){
        if(register.hasOwnProperty(type)){
            register[type].push(method)
        } else {
            register[type] = [method]
        }
    }

    obj.fire = function(type){
        if(register.hasOwnProperty(type)) {
            var methodList = register[type]
            for(var i = 0; i < methodList.length; ++i){
                var handle = methodList[i]
                var args = []
                for(var j = 1; j < arguments.length; ++j){
                    args.push(arguments[j])
                }
                console.log("event fire: " + type)
                handle.apply(this, args)
            }
        }
    }

    obj.removeLister = function(type){
        register[type] = []
    }

    obj.removeAllLister = function(){
        register = {}
    }

    return obj
}

// Cocos Creator 2.x CommonJS 导出
module.exports = eventLister;
