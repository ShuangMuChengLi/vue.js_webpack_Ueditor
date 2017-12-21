<template>
    <div class="wrap">
        <h1></h1>
        <a class="model" href="javascript:void(0)" @click="loadModel()">设置内容</a>
        <div id="editor" type="text/plain" style="height:500px;"></div>
    </div>
</template>

<script>
var UE = require("../../ueditor/ueditor.all");

export default {
    data () {
        return {

        }
    },
    beforeDestroy: function () {
        this.destroyUe();
    },
    mounted:function () {
        this.ue = UE.getEditor('editor',{'autoHeightEnabled': false});
    },
    methods: {
        loadModel (){
            this.ue.setContent("内容")
        },
        destroyUe(){
            UE.delEditor("editor");
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
    @import "../../css/index";
</style>
