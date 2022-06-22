<template>
  <div
    class="three-container"
    @dragover="dragover"
    @drop="drop"
    ref="three-container"
  >
    <div class="three-overlay">
      <div v-if="!modelIsVisible" class="drag-zone" @click="onClickDragZone">
        <div
          class="flex w-full h-screen items-center justify-center text-center"
          id="app"
        >
          <div>
            Drag USDZ file here or
            <span class="underline">click here</span>
          </div>
          <input
            type="file"
            multiple
            v-show="false"
            name="fields[assetsFieldHandle][]"
            class="w-px h-px opacity-0 overflow-hidden absolute"
            @change="onChange"
            ref="file"
            accept=".usdz"
          />
        </div>
      </div>
    </div>
    <div class="help-icon">
      <v-btn @click="dialog = !dialog" class="mx-2" fab dark color="indigo">
        <v-icon dark> mdi-help </v-icon>
      </v-btn>
    </div>
    <v-dialog v-model="dialog" width="500">
      <v-card>
        <v-card-title class="text-h5">
          Information about the player
        </v-card-title>

        <v-card-text class="mt-2">
          This player is based on the
          <a href="https://www.npmjs.com/package/three-usdz-loader"
            >three-usdz-loader</a
          >
          package<br />
          Contact: contact@usdz-viewer.net
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="dialog = false"> OK </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script src="./Home.ts"></script>
<style src="./Home.scss" lang="scss"></style>
