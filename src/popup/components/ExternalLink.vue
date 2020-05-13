<template>
    <a :href="url" @click="clicked">
        <slot></slot>
    </a>
</template>

<script>
    export default {
        props: ['url'],

        methods: {
            clicked(e) {
                e.preventDefault()

                chrome.tabs.create({ url: this.url })
            }
        }
    }
</script>
