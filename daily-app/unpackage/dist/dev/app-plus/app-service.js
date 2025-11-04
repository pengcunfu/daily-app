if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  const _imports_0 = "/static/empty.png";
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$5 = {
    data() {
      return {
        appearanceList: [],
        currentDate: "",
        loading: false
      };
    },
    computed: {
      thisMonthCount() {
        const now = /* @__PURE__ */ new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        return this.appearanceList.filter((item) => {
          const itemDate = new Date(item.createdAt);
          return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
        }).length;
      },
      avgRating() {
        if (this.appearanceList.length === 0)
          return 0;
        const totalRating = this.appearanceList.reduce((sum, item) => sum + (item.rating || 0), 0);
        return totalRating / this.appearanceList.length;
      }
    },
    onLoad() {
      this.initCurrentDate();
      this.loadAppearanceList();
    },
    onShow() {
      this.loadAppearanceList();
    },
    onPullDownRefresh() {
      this.loadAppearanceList();
      setTimeout(() => {
        uni.stopPullDownRefresh();
      }, 1e3);
    },
    methods: {
      initCurrentDate() {
        const now = /* @__PURE__ */ new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        this.currentDate = `${year}年${month}月${day}日`;
      },
      async loadAppearanceList() {
        this.loading = true;
        try {
          const localData = uni.getStorageSync("appearanceList") || [];
          this.appearanceList = localData.map((item) => ({
            ...item,
            photos: typeof item.photos === "string" ? JSON.parse(item.photos) : item.photos
          }));
        } catch (error) {
          formatAppLog("error", "at pages/index/index.vue:155", "加载形象记录失败:", error);
          uni.showToast({
            title: "加载失败",
            icon: "error"
          });
        } finally {
          this.loading = false;
        }
      },
      goToAdd() {
        uni.navigateTo({
          url: "/pages/appearance/add"
        });
      },
      goToDetail(item) {
        uni.navigateTo({
          url: `/pages/appearance/detail?id=${item.id}`
        });
      },
      formatDate(dateString) {
        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${month}-${day}`;
      }
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部欢迎区域 "),
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", { class: "welcome" }, [
          vue.createElementVNode("text", { class: "welcome-text" }, "今日形象记录"),
          vue.createElementVNode(
            "text",
            { class: "date" },
            vue.toDisplayString($data.currentDate),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", {
          class: "add-btn",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.goToAdd && $options.goToAdd(...args))
        }, [
          vue.createElementVNode("text", { class: "add-icon" }, "+")
        ])
      ]),
      vue.createCommentVNode(" 形象记录列表 "),
      vue.createElementVNode("view", { class: "content" }, [
        $data.appearanceList.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "empty"
        }, [
          vue.createElementVNode("image", {
            class: "empty-icon",
            src: _imports_0,
            mode: "aspectFit"
          }),
          vue.createElementVNode("text", { class: "empty-text" }, "还没有形象记录"),
          vue.createElementVNode("text", { class: "empty-desc" }, "点击右上角 + 号添加今日形象")
        ])) : (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "appearance-list"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.appearanceList, (item) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: item.id,
                class: "appearance-item",
                onClick: ($event) => $options.goToDetail(item)
              }, [
                vue.createElementVNode("view", { class: "item-images" }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList(item.photos.slice(0, 3), (photo, index) => {
                      return vue.openBlock(), vue.createElementBlock("image", {
                        key: index,
                        src: photo,
                        class: "item-image",
                        mode: "aspectFill"
                      }, null, 8, ["src"]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  item.photos.length > 3 ? (vue.openBlock(), vue.createElementBlock(
                    "view",
                    {
                      key: 0,
                      class: "more-count"
                    },
                    " +" + vue.toDisplayString(item.photos.length - 3),
                    1
                    /* TEXT */
                  )) : vue.createCommentVNode("v-if", true)
                ]),
                vue.createElementVNode("view", { class: "item-content" }, [
                  vue.createElementVNode("view", { class: "item-header" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "item-title" },
                      vue.toDisplayString(item.title),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "item-date" },
                      vue.toDisplayString($options.formatDate(item.createdAt)),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode(
                    "text",
                    { class: "item-desc" },
                    vue.toDisplayString(item.description),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "item-tags" }, [
                    item.mood ? (vue.openBlock(), vue.createElementBlock(
                      "text",
                      {
                        key: 0,
                        class: "tag mood"
                      },
                      vue.toDisplayString(item.mood),
                      1
                      /* TEXT */
                    )) : vue.createCommentVNode("v-if", true),
                    item.weather ? (vue.openBlock(), vue.createElementBlock(
                      "text",
                      {
                        key: 1,
                        class: "tag weather"
                      },
                      vue.toDisplayString(item.weather),
                      1
                      /* TEXT */
                    )) : vue.createCommentVNode("v-if", true),
                    item.occasion ? (vue.openBlock(), vue.createElementBlock(
                      "text",
                      {
                        key: 2,
                        class: "tag occasion"
                      },
                      vue.toDisplayString(item.occasion),
                      1
                      /* TEXT */
                    )) : vue.createCommentVNode("v-if", true)
                  ]),
                  item.rating ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "item-rating"
                  }, [
                    (vue.openBlock(), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList(5, (n) => {
                        return vue.createElementVNode(
                          "text",
                          {
                            key: n,
                            class: vue.normalizeClass(["star", { active: n <= item.rating }])
                          },
                          "★",
                          2
                          /* CLASS */
                        );
                      }),
                      64
                      /* STABLE_FRAGMENT */
                    ))
                  ])) : vue.createCommentVNode("v-if", true)
                ])
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]))
      ]),
      vue.createCommentVNode(" 底部统计 "),
      vue.createElementVNode("view", { class: "stats" }, [
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-number" },
            vue.toDisplayString($data.appearanceList.length),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "总记录")
        ]),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-number" },
            vue.toDisplayString($options.thisMonthCount),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "本月")
        ]),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-number" },
            vue.toDisplayString($options.avgRating.toFixed(1)),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "平均评分")
        ])
      ])
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-1cf27b2a"], ["__file", "D:/Data/Desktop/Projects/daily-app/daily-app/pages/index/index.vue"]]);
  const _sfc_main$4 = {
    data() {
      return {
        photoList: [],
        customTag: "",
        submitting: false,
        form: {
          title: "",
          description: "",
          mood: "",
          weather: "",
          occasion: "",
          rating: 0,
          tags: [],
          isPrivate: false
        },
        moodOptions: ["开心", "平静", "兴奋", "疲惫", "焦虑", "满足", "期待"],
        weatherOptions: ["晴天", "多云", "阴天", "雨天", "雪天"],
        tagSuggestions: ["休闲", "正式", "运动", "约会", "工作", "聚会", "旅行", "居家"]
      };
    },
    computed: {
      canSubmit() {
        return this.photoList.length > 0 && this.form.title.trim();
      }
    },
    onLoad() {
      this.generateDefaultTitle();
    },
    methods: {
      generateDefaultTitle() {
        const now = /* @__PURE__ */ new Date();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        this.form.title = `${month}月${day}日的形象记录`;
      },
      async chooseImage() {
        try {
          const res = await uni.chooseImage({
            count: 9 - this.photoList.length,
            sizeType: ["compressed"],
            sourceType: ["camera", "album"]
          });
          this.photoList.push(...res.tempFilePaths);
        } catch (error) {
          formatAppLog("error", "at pages/appearance/add.vue:258", "选择图片失败:", error);
        }
      },
      removePhoto(index) {
        this.photoList.splice(index, 1);
      },
      addTag(tag) {
        if (!this.form.tags.includes(tag) && this.form.tags.length < 10) {
          this.form.tags.push(tag);
        }
      },
      removeTag(index) {
        this.form.tags.splice(index, 1);
      },
      addCustomTag() {
        const tag = this.customTag.trim();
        if (tag && !this.form.tags.includes(tag) && this.form.tags.length < 10) {
          this.form.tags.push(tag);
          this.customTag = "";
        }
      },
      handlePrivacyChange(e) {
        this.form.isPrivate = e.detail.value;
      },
      getRatingText(rating) {
        const texts = ["", "一般", "还行", "不错", "很好", "完美"];
        return texts[rating] || "";
      },
      async handleSubmit() {
        if (!this.canSubmit || this.submitting)
          return;
        this.submitting = true;
        try {
          const id = Date.now().toString();
          const appearanceData = {
            id,
            ...this.form,
            photos: this.photoList,
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
            syncStatus: "local"
            // 标记为本地数据
          };
          const existingData = uni.getStorageSync("appearanceList") || [];
          existingData.unshift(appearanceData);
          uni.setStorageSync("appearanceList", existingData);
          uni.showToast({
            title: "保存成功",
            icon: "success"
          });
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } catch (error) {
          formatAppLog("error", "at pages/appearance/add.vue:330", "保存失败:", error);
          uni.showToast({
            title: "保存失败",
            icon: "error"
          });
        } finally {
          this.submitting = false;
        }
      }
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode(
        "form",
        {
          onSubmit: _cache[9] || (_cache[9] = (...args) => $options.handleSubmit && $options.handleSubmit(...args))
        },
        [
          vue.createCommentVNode(" 照片上传区域 "),
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("view", { class: "section-title" }, [
              vue.createElementVNode("text", { class: "title-text" }, "今日照片"),
              vue.createElementVNode("text", { class: "required" }, "*")
            ]),
            vue.createElementVNode("view", { class: "photo-upload" }, [
              vue.createElementVNode("view", { class: "photo-list" }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($data.photoList, (photo, index) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: index,
                      class: "photo-item"
                    }, [
                      vue.createElementVNode("image", {
                        src: photo,
                        class: "photo-image",
                        mode: "aspectFill"
                      }, null, 8, ["src"]),
                      vue.createElementVNode("view", {
                        class: "photo-delete",
                        onClick: ($event) => $options.removePhoto(index)
                      }, [
                        vue.createElementVNode("text", { class: "delete-icon" }, "×")
                      ], 8, ["onClick"])
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                )),
                $data.photoList.length < 9 ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "photo-add",
                  onClick: _cache[0] || (_cache[0] = (...args) => $options.chooseImage && $options.chooseImage(...args))
                }, [
                  vue.createElementVNode("text", { class: "add-icon" }, "+"),
                  vue.createElementVNode("text", { class: "add-text" }, "添加照片")
                ])) : vue.createCommentVNode("v-if", true)
              ]),
              vue.createElementVNode("text", { class: "photo-tip" }, "最多可上传9张照片")
            ])
          ]),
          vue.createCommentVNode(" 基本信息 "),
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("view", { class: "section-title" }, [
              vue.createElementVNode("text", { class: "title-text" }, "基本信息")
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode("text", { class: "label" }, "标题"),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.form.title = $event),
                  class: "input",
                  placeholder: "给今天的形象起个标题吧",
                  maxlength: "50"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.form.title]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode("text", { class: "label" }, "描述"),
              vue.withDirectives(vue.createElementVNode(
                "textarea",
                {
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.form.description = $event),
                  class: "textarea",
                  placeholder: "描述一下今天的穿搭心得...",
                  maxlength: "200"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.form.description]
              ])
            ])
          ]),
          vue.createCommentVNode(" 心情和环境 "),
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("view", { class: "section-title" }, [
              vue.createElementVNode("text", { class: "title-text" }, "心情与环境")
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode("text", { class: "label" }, "今日心情"),
              vue.createElementVNode("view", { class: "tag-selector" }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($data.moodOptions, (mood) => {
                    return vue.openBlock(), vue.createElementBlock("text", {
                      key: mood,
                      class: vue.normalizeClass(["tag-option", { active: $data.form.mood === mood }]),
                      onClick: ($event) => $data.form.mood = $data.form.mood === mood ? "" : mood
                    }, vue.toDisplayString(mood), 11, ["onClick"]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode("text", { class: "label" }, "天气情况"),
              vue.createElementVNode("view", { class: "tag-selector" }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($data.weatherOptions, (weather) => {
                    return vue.openBlock(), vue.createElementBlock("text", {
                      key: weather,
                      class: vue.normalizeClass(["tag-option", { active: $data.form.weather === weather }]),
                      onClick: ($event) => $data.form.weather = $data.form.weather === weather ? "" : weather
                    }, vue.toDisplayString(weather), 11, ["onClick"]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode("text", { class: "label" }, "场合"),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.form.occasion = $event),
                  class: "input",
                  placeholder: "如：上班、约会、聚餐等",
                  maxlength: "20"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.form.occasion]
              ])
            ])
          ]),
          vue.createCommentVNode(" 评分 "),
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("view", { class: "section-title" }, [
              vue.createElementVNode("text", { class: "title-text" }, "满意度评分")
            ]),
            vue.createElementVNode("view", { class: "rating-selector" }, [
              (vue.openBlock(), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList(5, (n) => {
                  return vue.createElementVNode("text", {
                    key: n,
                    class: vue.normalizeClass(["rating-star", { active: n <= $data.form.rating }]),
                    onClick: ($event) => $data.form.rating = n
                  }, " ★ ", 10, ["onClick"]);
                }),
                64
                /* STABLE_FRAGMENT */
              )),
              vue.createElementVNode(
                "text",
                { class: "rating-text" },
                vue.toDisplayString($options.getRatingText($data.form.rating)),
                1
                /* TEXT */
              )
            ])
          ]),
          vue.createCommentVNode(" 标签 "),
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("view", { class: "section-title" }, [
              vue.createElementVNode("text", { class: "title-text" }, "标签")
            ]),
            vue.createElementVNode("view", { class: "tag-input" }, [
              vue.createElementVNode("view", { class: "selected-tags" }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($data.form.tags, (tag, index) => {
                    return vue.openBlock(), vue.createElementBlock("text", {
                      key: index,
                      class: "selected-tag",
                      onClick: ($event) => $options.removeTag(index)
                    }, vue.toDisplayString(tag) + " × ", 9, ["onClick"]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]),
              vue.createElementVNode("view", { class: "tag-suggestions" }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($data.tagSuggestions, (tag) => {
                    return vue.openBlock(), vue.createElementBlock("text", {
                      key: tag,
                      class: "tag-suggestion",
                      onClick: ($event) => $options.addTag(tag)
                    }, vue.toDisplayString(tag), 9, ["onClick"]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]),
              vue.createElementVNode("view", { class: "custom-tag-input" }, [
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $data.customTag = $event),
                    class: "tag-input-field",
                    placeholder: "自定义标签",
                    onConfirm: _cache[5] || (_cache[5] = (...args) => $options.addCustomTag && $options.addCustomTag(...args))
                  },
                  null,
                  544
                  /* NEED_HYDRATION, NEED_PATCH */
                ), [
                  [vue.vModelText, $data.customTag]
                ]),
                vue.createElementVNode("button", {
                  type: "button",
                  class: "tag-add-btn",
                  onClick: _cache[6] || (_cache[6] = (...args) => $options.addCustomTag && $options.addCustomTag(...args))
                }, " 添加 ")
              ])
            ])
          ]),
          vue.createCommentVNode(" 隐私设置 "),
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode("text", { class: "label" }, "隐私设置"),
              vue.createElementVNode("switch", {
                checked: $data.form.isPrivate,
                onChange: _cache[7] || (_cache[7] = (...args) => $options.handlePrivacyChange && $options.handlePrivacyChange(...args)),
                color: "#007AFF"
              }, null, 40, ["checked"]),
              vue.createElementVNode("text", { class: "privacy-desc" }, "开启后仅自己可见")
            ])
          ]),
          vue.createCommentVNode(" 提交按钮 "),
          vue.createElementVNode("view", { class: "submit-section" }, [
            vue.createElementVNode("button", {
              class: vue.normalizeClass(["submit-btn", { disabled: !$options.canSubmit }]),
              disabled: !$options.canSubmit || $data.submitting,
              onClick: _cache[8] || (_cache[8] = (...args) => $options.handleSubmit && $options.handleSubmit(...args))
            }, vue.toDisplayString($data.submitting ? "保存中..." : "保存记录"), 11, ["disabled"])
          ])
        ],
        32
        /* NEED_HYDRATION */
      )
    ]);
  }
  const PagesAppearanceAdd = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-26a999c5"], ["__file", "D:/Data/Desktop/Projects/daily-app/daily-app/pages/appearance/add.vue"]]);
  const _sfc_main$3 = {
    data() {
      return {
        appearance: null,
        appearanceId: ""
      };
    },
    onLoad(options) {
      this.appearanceId = options.id;
      this.loadAppearance();
    },
    methods: {
      async loadAppearance() {
        try {
          const appearanceList = uni.getStorageSync("appearanceList") || [];
          const appearance = appearanceList.find((item) => item.id === this.appearanceId);
          if (appearance) {
            this.appearance = {
              ...appearance,
              photos: typeof appearance.photos === "string" ? JSON.parse(appearance.photos) : appearance.photos,
              tags: typeof appearance.tags === "string" ? JSON.parse(appearance.tags) : appearance.tags
            };
          } else {
            uni.showToast({
              title: "记录不存在",
              icon: "error"
            });
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
          }
        } catch (error) {
          formatAppLog("error", "at pages/appearance/detail.vue:148", "加载形象记录失败:", error);
          uni.showToast({
            title: "加载失败",
            icon: "error"
          });
        }
      },
      previewImage(index) {
        uni.previewImage({
          urls: this.appearance.photos,
          current: index
        });
      },
      formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}年${month}月${day}日 ${hours}:${minutes}`;
      },
      getRatingText(rating) {
        const texts = ["", "一般", "还行", "不错", "很好", "完美"];
        return texts[rating] || "";
      },
      editAppearance() {
        uni.showToast({
          title: "编辑功能开发中",
          icon: "none"
        });
      },
      async deleteAppearance() {
        try {
          const result = await uni.showModal({
            title: "确认删除",
            content: "删除后无法恢复，确定要删除这条记录吗？",
            confirmColor: "#FF6B6B"
          });
          if (result.confirm) {
            const appearanceList = uni.getStorageSync("appearanceList") || [];
            const newList = appearanceList.filter((item) => item.id !== this.appearanceId);
            uni.setStorageSync("appearanceList", newList);
            uni.showToast({
              title: "删除成功",
              icon: "success"
            });
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
          }
        } catch (error) {
          formatAppLog("error", "at pages/appearance/detail.vue:210", "删除失败:", error);
          uni.showToast({
            title: "删除失败",
            icon: "error"
          });
        }
      },
      shareAppearance() {
        uni.showToast({
          title: "分享功能开发中",
          icon: "none"
        });
      }
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      $data.appearance ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "content"
      }, [
        vue.createCommentVNode(" 照片展示 "),
        vue.createElementVNode("view", { class: "photo-section" }, [
          vue.createElementVNode("swiper", {
            class: "photo-swiper",
            "indicator-dots": $data.appearance.photos.length > 1,
            autoplay: false,
            circular: true
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.appearance.photos, (photo, index) => {
                return vue.openBlock(), vue.createElementBlock("swiper-item", { key: index }, [
                  vue.createElementVNode("image", {
                    src: photo,
                    class: "photo-image",
                    mode: "aspectFill",
                    onClick: ($event) => $options.previewImage(index)
                  }, null, 8, ["src", "onClick"])
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ], 8, ["indicator-dots"])
        ]),
        vue.createCommentVNode(" 基本信息 "),
        vue.createElementVNode("view", { class: "info-section" }, [
          vue.createElementVNode("view", { class: "header" }, [
            vue.createElementVNode(
              "text",
              { class: "title" },
              vue.toDisplayString($data.appearance.title),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "date" },
              vue.toDisplayString($options.formatDate($data.appearance.createdAt)),
              1
              /* TEXT */
            )
          ]),
          $data.appearance.description ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 0,
              class: "description"
            },
            vue.toDisplayString($data.appearance.description),
            1
            /* TEXT */
          )) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 评分 "),
          $data.appearance.rating ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "rating"
          }, [
            vue.createElementVNode("text", { class: "rating-label" }, "满意度："),
            (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList(5, (n) => {
                return vue.createElementVNode(
                  "text",
                  {
                    key: n,
                    class: vue.normalizeClass(["star", { active: n <= $data.appearance.rating }])
                  },
                  "★",
                  2
                  /* CLASS */
                );
              }),
              64
              /* STABLE_FRAGMENT */
            )),
            vue.createElementVNode(
              "text",
              { class: "rating-text" },
              vue.toDisplayString($options.getRatingText($data.appearance.rating)),
              1
              /* TEXT */
            )
          ])) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createCommentVNode(" 标签和环境信息 "),
        vue.createElementVNode("view", { class: "tags-section" }, [
          $data.appearance.mood ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "tag-group"
          }, [
            vue.createElementVNode("text", { class: "tag-label" }, "心情："),
            vue.createElementVNode(
              "text",
              { class: "tag mood" },
              vue.toDisplayString($data.appearance.mood),
              1
              /* TEXT */
            )
          ])) : vue.createCommentVNode("v-if", true),
          $data.appearance.weather ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "tag-group"
          }, [
            vue.createElementVNode("text", { class: "tag-label" }, "天气："),
            vue.createElementVNode(
              "text",
              { class: "tag weather" },
              vue.toDisplayString($data.appearance.weather),
              1
              /* TEXT */
            )
          ])) : vue.createCommentVNode("v-if", true),
          $data.appearance.occasion ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 2,
            class: "tag-group"
          }, [
            vue.createElementVNode("text", { class: "tag-label" }, "场合："),
            vue.createElementVNode(
              "text",
              { class: "tag occasion" },
              vue.toDisplayString($data.appearance.occasion),
              1
              /* TEXT */
            )
          ])) : vue.createCommentVNode("v-if", true),
          $data.appearance.tags && $data.appearance.tags.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 3,
            class: "tag-group"
          }, [
            vue.createElementVNode("text", { class: "tag-label" }, "标签："),
            vue.createElementVNode("view", { class: "custom-tags" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.appearance.tags, (tag) => {
                  return vue.openBlock(), vue.createElementBlock(
                    "text",
                    {
                      key: tag,
                      class: "tag custom"
                    },
                    vue.toDisplayString(tag),
                    1
                    /* TEXT */
                  );
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createCommentVNode(" 隐私状态 "),
        $data.appearance.isPrivate ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "privacy-notice"
        }, [
          vue.createElementVNode("text", { class: "privacy-icon" }, "🔒"),
          vue.createElementVNode("text", { class: "privacy-text" }, "仅自己可见")
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 操作按钮 "),
        vue.createElementVNode("view", { class: "actions" }, [
          vue.createElementVNode("button", {
            class: "action-btn edit-btn",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.editAppearance && $options.editAppearance(...args))
          }, " 编辑 "),
          vue.createElementVNode("button", {
            class: "action-btn delete-btn",
            onClick: _cache[1] || (_cache[1] = (...args) => $options.deleteAppearance && $options.deleteAppearance(...args))
          }, " 删除 "),
          vue.createElementVNode("button", {
            class: "action-btn share-btn",
            onClick: _cache[2] || (_cache[2] = (...args) => $options.shareAppearance && $options.shareAppearance(...args))
          }, " 分享 ")
        ])
      ])) : (vue.openBlock(), vue.createElementBlock(
        vue.Fragment,
        { key: 1 },
        [
          vue.createCommentVNode(" 加载状态 "),
          vue.createElementVNode("view", { class: "loading" }, [
            vue.createElementVNode("text", { class: "loading-text" }, "加载中...")
          ])
        ],
        2112
        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
      ))
    ]);
  }
  const PagesAppearanceDetail = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-79a3a2eb"], ["__file", "D:/Data/Desktop/Projects/daily-app/daily-app/pages/appearance/detail.vue"]]);
  const _sfc_main$2 = {
    data() {
      return {
        userInfo: {},
        appearanceList: [],
        isLoggedIn: false,
        syncStatus: "本地存储"
      };
    },
    computed: {
      totalRecords() {
        return this.appearanceList.length;
      },
      thisMonthRecords() {
        const now = /* @__PURE__ */ new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        return this.appearanceList.filter((item) => {
          const itemDate = new Date(item.createdAt);
          return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
        }).length;
      },
      avgRating() {
        if (this.appearanceList.length === 0)
          return 0;
        const totalRating = this.appearanceList.reduce((sum, item) => sum + (item.rating || 0), 0);
        return totalRating / this.appearanceList.length;
      },
      continuousDays() {
        if (this.appearanceList.length === 0)
          return 0;
        const sortedList = this.appearanceList.map((item) => new Date(item.createdAt).toDateString()).filter((date, index, arr) => arr.indexOf(date) === index).sort((a, b) => new Date(b) - new Date(a));
        let continuous = 1;
        const today = (/* @__PURE__ */ new Date()).toDateString();
        if (sortedList[0] !== today)
          return 0;
        for (let i = 1; i < sortedList.length; i++) {
          const currentDate = new Date(sortedList[i]);
          const prevDate = new Date(sortedList[i - 1]);
          const diffDays = (prevDate - currentDate) / (1e3 * 60 * 60 * 24);
          if (diffDays === 1) {
            continuous++;
          } else {
            break;
          }
        }
        return continuous;
      }
    },
    onShow() {
      this.loadUserInfo();
      this.loadAppearanceData();
    },
    methods: {
      loadUserInfo() {
        const userInfo = uni.getStorageSync("userInfo");
        if (userInfo) {
          this.userInfo = userInfo;
          this.isLoggedIn = true;
          this.syncStatus = "已同步";
        } else {
          this.userInfo = {};
          this.isLoggedIn = false;
          this.syncStatus = "本地存储";
        }
      },
      loadAppearanceData() {
        const appearanceList = uni.getStorageSync("appearanceList") || [];
        this.appearanceList = appearanceList;
      },
      handleLogin() {
        if (this.isLoggedIn) {
          uni.showToast({
            title: "已登录",
            icon: "success"
          });
        } else {
          uni.navigateTo({
            url: "/pages/login/index"
          });
        }
      },
      async handleLogout() {
        try {
          const result = await uni.showModal({
            title: "确认退出",
            content: "退出登录后，数据将只保存在本地",
            confirmColor: "#FF6B6B"
          });
          if (result.confirm) {
            uni.removeStorageSync("userInfo");
            uni.removeStorageSync("token");
            this.userInfo = {};
            this.isLoggedIn = false;
            this.syncStatus = "本地存储";
            uni.showToast({
              title: "已退出登录",
              icon: "success"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/profile/index.vue:223", "退出登录失败:", error);
        }
      },
      goToDataManage() {
        uni.showActionSheet({
          itemList: ["导出数据", "导入数据", "清空数据"],
          success: (res) => {
            switch (res.tapIndex) {
              case 0:
                this.exportData();
                break;
              case 1:
                this.importData();
                break;
              case 2:
                this.clearData();
                break;
            }
          }
        });
      },
      async exportData() {
        try {
          const data = {
            appearanceList: this.appearanceList,
            userInfo: this.userInfo,
            exportTime: (/* @__PURE__ */ new Date()).toISOString()
          };
          uni.showToast({
            title: "导出功能开发中",
            icon: "none"
          });
        } catch (error) {
          formatAppLog("error", "at pages/profile/index.vue:260", "导出数据失败:", error);
        }
      },
      importData() {
        uni.showToast({
          title: "导入功能开发中",
          icon: "none"
        });
      },
      async clearData() {
        try {
          const result = await uni.showModal({
            title: "确认清空",
            content: "清空后数据无法恢复，确定要清空所有数据吗？",
            confirmColor: "#FF6B6B"
          });
          if (result.confirm) {
            uni.removeStorageSync("appearanceList");
            this.appearanceList = [];
            uni.showToast({
              title: "数据已清空",
              icon: "success"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/profile/index.vue:290", "清空数据失败:", error);
        }
      },
      goToSync() {
        if (this.isLoggedIn) {
          uni.showToast({
            title: "同步功能开发中",
            icon: "none"
          });
        } else {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
        }
      },
      goToBackup() {
        uni.showToast({
          title: "备份功能开发中",
          icon: "none"
        });
      },
      goToSettings() {
        uni.showToast({
          title: "设置功能开发中",
          icon: "none"
        });
      },
      goToHelp() {
        uni.showToast({
          title: "帮助功能开发中",
          icon: "none"
        });
      },
      goToAbout() {
        uni.showModal({
          title: "DailyApp",
          content: "版本 1.0.0\n\n一个简单易用的形象管理应用\n记录每天的美好瞬间",
          showCancel: false
        });
      }
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 用户信息区域 "),
      vue.createElementVNode("view", { class: "user-section" }, [
        vue.createElementVNode("view", { class: "user-info" }, [
          vue.createElementVNode("image", {
            src: $data.userInfo.avatar || "/static/default-avatar.png",
            class: "avatar",
            mode: "aspectFill"
          }, null, 8, ["src"]),
          vue.createElementVNode("view", { class: "user-details" }, [
            vue.createElementVNode(
              "text",
              { class: "username" },
              vue.toDisplayString($data.userInfo.username || "未登录用户"),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "user-desc" },
              vue.toDisplayString($data.userInfo.email || "点击登录享受更多功能"),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", {
            class: "login-btn",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.handleLogin && $options.handleLogin(...args))
          }, [
            vue.createElementVNode(
              "text",
              { class: "login-text" },
              vue.toDisplayString($data.isLoggedIn ? "已登录" : "登录"),
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      vue.createCommentVNode(" 统计信息 "),
      vue.createElementVNode("view", { class: "stats-section" }, [
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-number" },
            vue.toDisplayString($options.totalRecords),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "总记录")
        ]),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-number" },
            vue.toDisplayString($options.thisMonthRecords),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "本月记录")
        ]),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-number" },
            vue.toDisplayString($options.avgRating.toFixed(1)),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "平均评分")
        ]),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-number" },
            vue.toDisplayString($options.continuousDays),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "连续天数")
        ])
      ]),
      vue.createCommentVNode(" 功能菜单 "),
      vue.createElementVNode("view", { class: "menu-section" }, [
        vue.createElementVNode("view", { class: "menu-group" }, [
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[1] || (_cache[1] = (...args) => $options.goToDataManage && $options.goToDataManage(...args))
          }, [
            vue.createElementVNode("view", { class: "menu-icon" }, "📊"),
            vue.createElementVNode("text", { class: "menu-text" }, "数据管理"),
            vue.createElementVNode("text", { class: "menu-arrow" }, ">")
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[2] || (_cache[2] = (...args) => $options.goToSync && $options.goToSync(...args))
          }, [
            vue.createElementVNode("view", { class: "menu-icon" }, "🔄"),
            vue.createElementVNode("text", { class: "menu-text" }, "数据同步"),
            vue.createElementVNode("view", { class: "sync-status" }, [
              vue.createElementVNode(
                "text",
                { class: "sync-text" },
                vue.toDisplayString($data.syncStatus),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("text", { class: "menu-arrow" }, ">")
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[3] || (_cache[3] = (...args) => $options.goToBackup && $options.goToBackup(...args))
          }, [
            vue.createElementVNode("view", { class: "menu-icon" }, "💾"),
            vue.createElementVNode("text", { class: "menu-text" }, "数据备份"),
            vue.createElementVNode("text", { class: "menu-arrow" }, ">")
          ])
        ]),
        vue.createElementVNode("view", { class: "menu-group" }, [
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[4] || (_cache[4] = (...args) => $options.goToSettings && $options.goToSettings(...args))
          }, [
            vue.createElementVNode("view", { class: "menu-icon" }, "⚙️"),
            vue.createElementVNode("text", { class: "menu-text" }, "设置"),
            vue.createElementVNode("text", { class: "menu-arrow" }, ">")
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[5] || (_cache[5] = (...args) => $options.goToHelp && $options.goToHelp(...args))
          }, [
            vue.createElementVNode("view", { class: "menu-icon" }, "❓"),
            vue.createElementVNode("text", { class: "menu-text" }, "帮助与反馈"),
            vue.createElementVNode("text", { class: "menu-arrow" }, ">")
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[6] || (_cache[6] = (...args) => $options.goToAbout && $options.goToAbout(...args))
          }, [
            vue.createElementVNode("view", { class: "menu-icon" }, "ℹ️"),
            vue.createElementVNode("text", { class: "menu-text" }, "关于我们"),
            vue.createElementVNode("text", { class: "menu-arrow" }, ">")
          ])
        ])
      ]),
      vue.createCommentVNode(" 退出登录按钮 "),
      $data.isLoggedIn ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "logout-section"
      }, [
        vue.createElementVNode("button", {
          class: "logout-btn",
          onClick: _cache[7] || (_cache[7] = (...args) => $options.handleLogout && $options.handleLogout(...args))
        }, " 退出登录 ")
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesProfileIndex = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-201c0da5"], ["__file", "D:/Data/Desktop/Projects/daily-app/daily-app/pages/profile/index.vue"]]);
  const _sfc_main$1 = {
    data() {
      return {
        currentTab: "login",
        loginLoading: false,
        registerLoading: false,
        loginForm: {
          email: "",
          password: ""
        },
        registerForm: {
          username: "",
          email: "",
          password: "",
          confirmPassword: ""
        }
      };
    },
    computed: {
      canLogin() {
        return this.loginForm.email.trim() && this.loginForm.password.trim();
      },
      canRegister() {
        return this.registerForm.username.trim() && this.registerForm.email.trim() && this.registerForm.password.length >= 6 && this.registerForm.password === this.registerForm.confirmPassword;
      }
    },
    onLoad() {
      const userInfo = uni.getStorageSync("userInfo");
      if (userInfo) {
        uni.navigateBack();
      }
    },
    methods: {
      async handleLogin() {
        if (!this.canLogin || this.loginLoading)
          return;
        this.loginLoading = true;
        try {
          await this.simulateLogin();
          const userInfo = {
            username: "用户" + Math.random().toString(36).substr(2, 4),
            email: this.loginForm.email,
            avatar: "",
            loginTime: (/* @__PURE__ */ new Date()).toISOString()
          };
          uni.setStorageSync("userInfo", userInfo);
          uni.setStorageSync("token", "mock-token-" + Date.now());
          uni.showToast({
            title: "登录成功",
            icon: "success"
          });
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } catch (error) {
          formatAppLog("error", "at pages/login/index.vue:217", "登录失败:", error);
          uni.showToast({
            title: "登录失败",
            icon: "error"
          });
        } finally {
          this.loginLoading = false;
        }
      },
      async handleRegister() {
        if (!this.canRegister || this.registerLoading)
          return;
        this.registerLoading = true;
        try {
          await this.simulateRegister();
          const userInfo = {
            username: this.registerForm.username,
            email: this.registerForm.email,
            avatar: "",
            registerTime: (/* @__PURE__ */ new Date()).toISOString()
          };
          uni.setStorageSync("userInfo", userInfo);
          uni.setStorageSync("token", "mock-token-" + Date.now());
          uni.showToast({
            title: "注册成功",
            icon: "success"
          });
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } catch (error) {
          formatAppLog("error", "at pages/login/index.vue:259", "注册失败:", error);
          uni.showToast({
            title: "注册失败",
            icon: "error"
          });
        } finally {
          this.registerLoading = false;
        }
      },
      continueAsGuest() {
        uni.showToast({
          title: "继续使用游客模式",
          icon: "success"
        });
        setTimeout(() => {
          uni.navigateBack();
        }, 1e3);
      },
      // 模拟登录请求
      simulateLogin() {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            if (this.loginForm.email && this.loginForm.password) {
              resolve();
            } else {
              reject(new Error("登录信息不完整"));
            }
          }, 1e3);
        });
      },
      // 模拟注册请求
      simulateRegister() {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            if (this.registerForm.username && this.registerForm.email && this.registerForm.password) {
              resolve();
            } else {
              reject(new Error("注册信息不完整"));
            }
          }, 1e3);
        });
      }
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部装饰 "),
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", { class: "logo-section" }, [
          vue.createElementVNode("text", { class: "logo" }, "📱"),
          vue.createElementVNode("text", { class: "app-name" }, "DailyApp"),
          vue.createElementVNode("text", { class: "app-desc" }, "记录每天的美好形象")
        ])
      ]),
      vue.createCommentVNode(" 登录表单 "),
      vue.createElementVNode("view", { class: "form-section" }, [
        vue.createElementVNode("view", { class: "form-container" }, [
          vue.createElementVNode("view", { class: "tab-header" }, [
            vue.createElementVNode(
              "text",
              {
                class: vue.normalizeClass(["tab-item", { active: $data.currentTab === "login" }]),
                onClick: _cache[0] || (_cache[0] = ($event) => $data.currentTab = "login")
              },
              " 登录 ",
              2
              /* CLASS */
            ),
            vue.createElementVNode(
              "text",
              {
                class: vue.normalizeClass(["tab-item", { active: $data.currentTab === "register" }]),
                onClick: _cache[1] || (_cache[1] = ($event) => $data.currentTab = "register")
              },
              " 注册 ",
              2
              /* CLASS */
            )
          ]),
          vue.createCommentVNode(" 登录表单 "),
          $data.currentTab === "login" ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "form"
          }, [
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.loginForm.email = $event),
                  class: "form-input",
                  type: "text",
                  placeholder: "请输入邮箱",
                  maxlength: 50
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.loginForm.email]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.loginForm.password = $event),
                  class: "form-input",
                  type: "password",
                  placeholder: "请输入密码",
                  maxlength: 20
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.loginForm.password]
              ])
            ]),
            vue.createElementVNode("button", {
              class: vue.normalizeClass(["submit-btn", { disabled: !$options.canLogin }]),
              disabled: !$options.canLogin || $data.loginLoading,
              onClick: _cache[4] || (_cache[4] = (...args) => $options.handleLogin && $options.handleLogin(...args))
            }, vue.toDisplayString($data.loginLoading ? "登录中..." : "登录"), 11, ["disabled"])
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 注册表单 "),
          $data.currentTab === "register" ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "form"
          }, [
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $data.registerForm.username = $event),
                  class: "form-input",
                  type: "text",
                  placeholder: "请输入用户名",
                  maxlength: 20
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.registerForm.username]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => $data.registerForm.email = $event),
                  class: "form-input",
                  type: "text",
                  placeholder: "请输入邮箱",
                  maxlength: 50
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.registerForm.email]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => $data.registerForm.password = $event),
                  class: "form-input",
                  type: "password",
                  placeholder: "请输入密码（6位以上）",
                  maxlength: 20
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.registerForm.password]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => $data.registerForm.confirmPassword = $event),
                  class: "form-input",
                  type: "password",
                  placeholder: "请确认密码",
                  maxlength: 20
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.registerForm.confirmPassword]
              ])
            ]),
            vue.createElementVNode("button", {
              class: vue.normalizeClass(["submit-btn", { disabled: !$options.canRegister }]),
              disabled: !$options.canRegister || $data.registerLoading,
              onClick: _cache[9] || (_cache[9] = (...args) => $options.handleRegister && $options.handleRegister(...args))
            }, vue.toDisplayString($data.registerLoading ? "注册中..." : "注册"), 11, ["disabled"])
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 其他登录方式 "),
          vue.createElementVNode("view", { class: "other-login" }, [
            vue.createElementVNode("view", { class: "divider" }, [
              vue.createElementVNode("text", { class: "divider-text" }, "或")
            ]),
            vue.createElementVNode("button", {
              class: "guest-btn",
              onClick: _cache[10] || (_cache[10] = (...args) => $options.continueAsGuest && $options.continueAsGuest(...args))
            }, " 游客模式继续使用 "),
            vue.createElementVNode("text", { class: "guest-tip" }, " 游客模式下数据仅保存在本地，登录后可同步到云端 ")
          ])
        ])
      ]),
      vue.createCommentVNode(" 底部信息 "),
      vue.createElementVNode("view", { class: "footer" }, [
        vue.createElementVNode("text", { class: "footer-text" }, " 登录即表示同意《用户协议》和《隐私政策》 ")
      ])
    ]);
  }
  const PagesLoginIndex = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-d08ef7d4"], ["__file", "D:/Data/Desktop/Projects/daily-app/daily-app/pages/login/index.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/appearance/add", PagesAppearanceAdd);
  __definePage("pages/appearance/detail", PagesAppearanceDetail);
  __definePage("pages/profile/index", PagesProfileIndex);
  __definePage("pages/login/index", PagesLoginIndex);
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("log", "at App.vue:4", "App Launch");
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:7", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:10", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "D:/Data/Desktop/Projects/daily-app/daily-app/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
