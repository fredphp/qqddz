
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/scripts/util/waitnode.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '17318Pv1MxELb6d+o/SHo0s', 'waitnode');
// scripts/util/waitnode.js

"use strict";

cc.Class({
  name: 'waitnode',
  "extends": cc.Component,
  properties: {
    loadimage_target: {
      type: cc.Node,
      "default": null
    },
    lblContent: {
      type: cc.Label,
      "default": null
    }
  },
  // LIFE-CYCLE CALLBACKS:
  onLoad: function onLoad() {
    this._isShow = false;
    this._isValid = true;
  },
  onDestroy: function onDestroy() {
    this._isValid = false;
  },
  start: function start() {
    if (this._isValid && this.node) {
      this.node.active = this._isShow;
    }
  },
  update: function update(dt) {
    if (!this._isValid || !this.node) return;
    if (this.loadimage_target && this.loadimage_target.isValid) {
      // 使用 angle 替代已废弃的 rotation 属性
      this.loadimage_target.angle = this.loadimage_target.angle + dt * 45;
    }
  },
  //content为label显示的内容
  show: function show(content) {
    if (!this._isValid || !this.node) return;
    this._isShow = true;
    this.node.active = this._isShow;
    if (this.lblContent && this.lblContent.isValid) {
      if (content == null) {
        content = "";
      }
      this.lblContent.string = content;
    }
  },
  hide: function hide() {
    if (!this._isValid || !this.node) return;
    this._isShow = false;
    this.node.active = this._isShow;
  }
});

cc._RF.pop();
                    }
                    if (nodeEnv) {
                        __define(__module.exports, __require, __module);
                    }
                    else {
                        __quick_compile_project__.registerModuleFunc(__filename, function () {
                            __define(__module.exports, __require, __module);
                        });
                    }
                })();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcc2NyaXB0c1xcdXRpbFxcd2FpdG5vZGUuanMiXSwibmFtZXMiOlsiY2MiLCJDbGFzcyIsIm5hbWUiLCJDb21wb25lbnQiLCJwcm9wZXJ0aWVzIiwibG9hZGltYWdlX3RhcmdldCIsInR5cGUiLCJOb2RlIiwibGJsQ29udGVudCIsIkxhYmVsIiwib25Mb2FkIiwiX2lzU2hvdyIsIl9pc1ZhbGlkIiwib25EZXN0cm95Iiwic3RhcnQiLCJub2RlIiwiYWN0aXZlIiwidXBkYXRlIiwiZHQiLCJpc1ZhbGlkIiwiYW5nbGUiLCJzaG93IiwiY29udGVudCIsInN0cmluZyIsImhpZGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0FBLEVBQUUsQ0FBQ0MsS0FBSyxDQUFDO0VBQ0xDLElBQUksRUFBRSxVQUFVO0VBQ2hCLFdBQVNGLEVBQUUsQ0FBQ0csU0FBUztFQUVyQkMsVUFBVSxFQUFFO0lBQ1JDLGdCQUFnQixFQUFFO01BQ2RDLElBQUksRUFBRU4sRUFBRSxDQUFDTyxJQUFJO01BQ2IsV0FBUztJQUNiLENBQUM7SUFDREMsVUFBVSxFQUFFO01BQ1JGLElBQUksRUFBRU4sRUFBRSxDQUFDUyxLQUFLO01BQ2QsV0FBUztJQUNiO0VBQ0osQ0FBQztFQUVEO0VBRUFDLE1BQU0sV0FBQUEsT0FBQSxFQUFJO0lBQ04sSUFBSSxDQUFDQyxPQUFPLEdBQUcsS0FBSztJQUNwQixJQUFJLENBQUNDLFFBQVEsR0FBRyxJQUFJO0VBQ3hCLENBQUM7RUFFREMsU0FBUyxXQUFBQSxVQUFBLEVBQUk7SUFDVCxJQUFJLENBQUNELFFBQVEsR0FBRyxLQUFLO0VBQ3pCLENBQUM7RUFFREUsS0FBSyxXQUFBQSxNQUFBLEVBQUk7SUFDTCxJQUFJLElBQUksQ0FBQ0YsUUFBUSxJQUFJLElBQUksQ0FBQ0csSUFBSSxFQUFFO01BQzVCLElBQUksQ0FBQ0EsSUFBSSxDQUFDQyxNQUFNLEdBQUcsSUFBSSxDQUFDTCxPQUFPO0lBQ25DO0VBQ0osQ0FBQztFQUVETSxNQUFNLFdBQUFBLE9BQUVDLEVBQUUsRUFBRTtJQUNSLElBQUksQ0FBQyxJQUFJLENBQUNOLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQ0csSUFBSSxFQUFFO0lBRWxDLElBQUksSUFBSSxDQUFDVixnQkFBZ0IsSUFBSSxJQUFJLENBQUNBLGdCQUFnQixDQUFDYyxPQUFPLEVBQUU7TUFDeEQ7TUFDQSxJQUFJLENBQUNkLGdCQUFnQixDQUFDZSxLQUFLLEdBQUcsSUFBSSxDQUFDZixnQkFBZ0IsQ0FBQ2UsS0FBSyxHQUFHRixFQUFFLEdBQUcsRUFBRTtJQUN2RTtFQUNKLENBQUM7RUFFRDtFQUNBRyxJQUFJLFdBQUFBLEtBQUNDLE9BQU8sRUFBQztJQUNULElBQUksQ0FBQyxJQUFJLENBQUNWLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQ0csSUFBSSxFQUFFO0lBRWxDLElBQUksQ0FBQ0osT0FBTyxHQUFHLElBQUk7SUFDbkIsSUFBSSxDQUFDSSxJQUFJLENBQUNDLE1BQU0sR0FBRyxJQUFJLENBQUNMLE9BQU87SUFFL0IsSUFBSSxJQUFJLENBQUNILFVBQVUsSUFBSSxJQUFJLENBQUNBLFVBQVUsQ0FBQ1csT0FBTyxFQUFFO01BQzVDLElBQUlHLE9BQU8sSUFBSSxJQUFJLEVBQUU7UUFDakJBLE9BQU8sR0FBRyxFQUFFO01BQ2hCO01BQ0EsSUFBSSxDQUFDZCxVQUFVLENBQUNlLE1BQU0sR0FBR0QsT0FBTztJQUNwQztFQUNKLENBQUM7RUFFREUsSUFBSSxXQUFBQSxLQUFBLEVBQUU7SUFDRixJQUFJLENBQUMsSUFBSSxDQUFDWixRQUFRLElBQUksQ0FBQyxJQUFJLENBQUNHLElBQUksRUFBRTtJQUVsQyxJQUFJLENBQUNKLE9BQU8sR0FBRyxLQUFLO0lBQ3BCLElBQUksQ0FBQ0ksSUFBSSxDQUFDQyxNQUFNLEdBQUcsSUFBSSxDQUFDTCxPQUFPO0VBQ25DO0FBRUosQ0FBQyxDQUFDIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJcbmNjLkNsYXNzKHtcbiAgICBuYW1lOiAnd2FpdG5vZGUnLFxuICAgIGV4dGVuZHM6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgbG9hZGltYWdlX3RhcmdldDoge1xuICAgICAgICAgICAgdHlwZTogY2MuTm9kZSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICAgICAgfSxcbiAgICAgICAgbGJsQ29udGVudDoge1xuICAgICAgICAgICAgdHlwZTogY2MuTGFiZWwsXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gTElGRS1DWUNMRSBDQUxMQkFDS1M6XG5cbiAgICBvbkxvYWQgKCkge1xuICAgICAgICB0aGlzLl9pc1Nob3cgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5faXNWYWxpZCA9IHRydWU7XG4gICAgfSxcbiAgICBcbiAgICBvbkRlc3Ryb3kgKCkge1xuICAgICAgICB0aGlzLl9pc1ZhbGlkID0gZmFsc2U7XG4gICAgfSxcblxuICAgIHN0YXJ0ICgpIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzVmFsaWQgJiYgdGhpcy5ub2RlKSB7XG4gICAgICAgICAgICB0aGlzLm5vZGUuYWN0aXZlID0gdGhpcy5faXNTaG93O1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHVwZGF0ZSAoZHQpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pc1ZhbGlkIHx8ICF0aGlzLm5vZGUpIHJldHVybjtcblxuICAgICAgICBpZiAodGhpcy5sb2FkaW1hZ2VfdGFyZ2V0ICYmIHRoaXMubG9hZGltYWdlX3RhcmdldC5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAvLyDkvb/nlKggYW5nbGUg5pu/5Luj5bey5bqf5byD55qEIHJvdGF0aW9uIOWxnuaAp1xuICAgICAgICAgICAgdGhpcy5sb2FkaW1hZ2VfdGFyZ2V0LmFuZ2xlID0gdGhpcy5sb2FkaW1hZ2VfdGFyZ2V0LmFuZ2xlICsgZHQgKiA0NTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvL2NvbnRlbnTkuLpsYWJlbOaYvuekuueahOWGheWuuVxuICAgIHNob3coY29udGVudCl7XG4gICAgICAgIGlmICghdGhpcy5faXNWYWxpZCB8fCAhdGhpcy5ub2RlKSByZXR1cm47XG4gICAgICAgIFxuICAgICAgICB0aGlzLl9pc1Nob3cgPSB0cnVlO1xuICAgICAgICB0aGlzLm5vZGUuYWN0aXZlID0gdGhpcy5faXNTaG93OyAgIFxuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMubGJsQ29udGVudCAmJiB0aGlzLmxibENvbnRlbnQuaXNWYWxpZCkge1xuICAgICAgICAgICAgaWYgKGNvbnRlbnQgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBcIlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5sYmxDb250ZW50LnN0cmluZyA9IGNvbnRlbnQ7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgaGlkZSgpe1xuICAgICAgICBpZiAoIXRoaXMuX2lzVmFsaWQgfHwgIXRoaXMubm9kZSkgcmV0dXJuO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5faXNTaG93ID0gZmFsc2U7XG4gICAgICAgIHRoaXMubm9kZS5hY3RpdmUgPSB0aGlzLl9pc1Nob3c7ICAgXG4gICAgfVxuXG59KTtcbiJdfQ==