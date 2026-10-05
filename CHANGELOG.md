# Changelog

## [1.0.0](https://github.com/Cofinpro/lanecraft/compare/v0.5.0...v1.0.0) (2026-10-05)

### ⚠ BREAKING CHANGES

* the plugin is now `flowforge`; reinstall as
  `flowforge@flowforge` and use the `/flowforge:` command prefix.
* the plugin is now `flowforge`; reinstall as
  `flowforge@flowforge` and use the `/flowforge:` command prefix.

* Reapply "refactor!: rename lanecraft to FlowForge and its notation to FlowSpec" ([2f50708](https://github.com/Cofinpro/lanecraft/commit/2f50708ea6a6afa960839822faff0c6ea3d0387e))

### Reverts

* undo rename of lanecraft to FlowForge/FlowSpec ([050f20e](https://github.com/Cofinpro/lanecraft/commit/050f20e7e96218b889e88c11c21455f54b33fc2f))

### Code Refactoring

* rename lanecraft to FlowForge and its notation to FlowSpec ([ce8dd53](https://github.com/Cofinpro/lanecraft/commit/ce8dd53cdb89aedf0901c944ae90cceb577f4f1a))

## [0.5.0](https://github.com/Cofinpro/lanecraft/compare/v0.4.1...v0.5.0) (2026-10-04)

### Features

* **bpmn-authoring:** add relabel.mjs to place labels without overlaps ([27c41ca](https://github.com/Cofinpro/lanecraft/commit/27c41caa47b974e3e95c7260cbf9cb8106cb3742))

### Bug Fixes

* **examples:** reposition user-story-refinement labels to avoid overlaps ([bc6cd03](https://github.com/Cofinpro/lanecraft/commit/bc6cd03243bcde9f3179b2e4d8aa24728df5bd11))
* **mapping:** keep annotations off labels, shapes and flow lines ([eca1698](https://github.com/Cofinpro/lanecraft/commit/eca16988a4fe4c0af9aae3e94de5aa0ec4034230))

## [0.4.1](https://github.com/Cofinpro/lanecraft/compare/v0.4.0...v0.4.1) (2026-10-04)

### Bug Fixes

* **cost:** read Workflow-tool agents and complete their output tokens ([#9](https://github.com/Cofinpro/lanecraft/issues/9)) ([ba76017](https://github.com/Cofinpro/lanecraft/commit/ba760170949ef8ccacc0aa5dfdbf9feeaee9ef8b))

## [0.4.0](https://github.com/Cofinpro/lanecraft/compare/v0.3.0...v0.4.0) (2026-10-04)

### Features

* **cost:** attribute run cost to bpmn elements, lanes and phases ([46945b9](https://github.com/Cofinpro/lanecraft/commit/46945b93d7ece96063b0842dfffffd3e5afb5c4a))
* **cost:** benchmark repeated runs and report spread per element ([98665bc](https://github.com/Cofinpro/lanecraft/commit/98665bce370003bea894bd5639e32b792f4adce8))
* **cost:** read usage from session transcripts with a versioned price table ([ad47cdf](https://github.com/Cofinpro/lanecraft/commit/ad47cdf3b51101159c9c48ae7e00ab9974ac8614))
* **generate:** emit a cost ledger hook and cost map per workflow ([2269775](https://github.com/Cofinpro/lanecraft/commit/226977533af1611366ea8ed75f717eb499184ced))
* **generate:** overlay run cost on the mapping view ([3515c84](https://github.com/Cofinpro/lanecraft/commit/3515c841e84b93d7f0da1274ec21e0efcff2cc5a))
* **generate:** prefix agent labels with the bpmn element id ([129cfce](https://github.com/Cofinpro/lanecraft/commit/129cfce4460e77482e203521e7db636727871f08))

### Bug Fixes

* **cost:** warn instead of fail when cost-state lags a resumed session ([3fd7ede](https://github.com/Cofinpro/lanecraft/commit/3fd7edea80d746c3e162e3f030c8e389e333dc2e))

## [0.3.0](https://github.com/Cofinpro/lanecraft/compare/v0.2.0...v0.3.0) (2026-10-04)

### Features

* **analyze:** inventory data stores and process io into contextSources ([bce54dc](https://github.com/Cofinpro/lanecraft/commit/bce54dc329bd93cbbb46f7f8e7b6c92b893d757f))
* **bpmn-authoring:** support data stores and process io; add context-flow fixtures ([b9f45f3](https://github.com/Cofinpro/lanecraft/commit/b9f45f32e9a32912fc61dac61b9ef66f3cf234a6))
* **design:** add contextSources and workflowIO to the spec contract ([66c450d](https://github.com/Cofinpro/lanecraft/commit/66c450d20eac5ed2408dfff9ef15aacf3f786f0c))
* **design:** resolve live store tools and place them per role ([0cd4bf0](https://github.com/Cofinpro/lanecraft/commit/0cd4bf0e41bf54d7c76c6d48f28bc5f4fbbc07ad))
* **examples:** add per-phase knowledge stores to user-story-refinement ([c386aac](https://github.com/Cofinpro/lanecraft/commit/c386aac1b860f007fa905d2a09bbd7521ec8a684))
* **examples:** add the Feedback process input to user-story-refinement ([be402f5](https://github.com/Cofinpro/lanecraft/commit/be402f557d20d62c9981d6d222e13930ade3f428))
* **examples:** let five more Product Owner tasks read the knowledge stores ([3464496](https://github.com/Cofinpro/lanecraft/commit/3464496d69e3bbe1d5e5a224f9912b8a8a90f34f))
* **examples:** let the five human checkpoints read the knowledge stores ([67d56f0](https://github.com/Cofinpro/lanecraft/commit/67d56f01267a7407b6d1187c5afd97dd3670e6e0))
* **examples:** read and write the user-story-refinement backlog in GitHub ([94cfca0](https://github.com/Cofinpro/lanecraft/commit/94cfca00a2832328368ddc167660e60f77bcaa36))
* **generate:** emit context sources, write guard and memory hooks ([a485bbc](https://github.com/Cofinpro/lanecraft/commit/a485bbcbda4869317500af3f77eeea5ab0cd94f9))
* **generate:** install per-task knowledge files as trimmed references ([b85d6d7](https://github.com/Cofinpro/lanecraft/commit/b85d6d75d3e5906c13e51f1228b50afcdd868810))
* **knowledge:** ground tasks from knowledge stores in the diagram ([3f0a9a9](https://github.com/Cofinpro/lanecraft/commit/3f0a9a9d6868c8bc698f39790ad76f837720a8ac))
* **skills:** ask for context sources in bpmn-process-design ([1df1ada](https://github.com/Cofinpro/lanecraft/commit/1df1ada3dceabc30fe16bc84b9613120da52d877))
* **verify:** trace context sources and guard live store writes ([47662b8](https://github.com/Cofinpro/lanecraft/commit/47662b8d34ffbc1c04363fdd5d19345cadab6489))

### Bug Fixes

* **generate:** colour context sources rose instead of turquoise ([53c300f](https://github.com/Cofinpro/lanecraft/commit/53c300f31fd8a615b0c2e5404755c52a8a4f6c9a)), references [#F8BBD0](https://github.com/Cofinpro/lanecraft/issues/F8BBD0) [#880E4F](https://github.com/Cofinpro/lanecraft/issues/880E4F)
* **generate:** keep live and memory bullets when installing knowledge ([5aaba0b](https://github.com/Cofinpro/lanecraft/commit/5aaba0b577165f0d7ea2f7d15d7c40ce0cc5614b))
* **generate:** quote the argument-hint value so the frontmatter parses ([085538e](https://github.com/Cofinpro/lanecraft/commit/085538ee510cb1b2c990a6f39e7c94052615bc0c))
* **verify:** account for the context hooks in the artifact trace ([1fbb07e](https://github.com/Cofinpro/lanecraft/commit/1fbb07e017cbcc2994b029da6cbb153718fc58a7))
* **verify:** require workflow io entries only for real and chosen entries ([b841784](https://github.com/Cofinpro/lanecraft/commit/b841784ffdab72679b8cde610601f254e70837af))

## 0.2.0 (2026-09-28)

### Features

* **examples:** run user-story-refinement through the pipeline ([d5dcfce](https://github.com/Cofinpro/lanecraft/commit/d5dcfcefc3f81b485f7af7f7b561681a39c6e1d2))
* generate a copy-paste .claude/ payload with fewer scripts ([9cf5f7d](https://github.com/Cofinpro/lanecraft/commit/9cf5f7d194d2b376a9e2753cae35e66d675ed545))
* init ([2a0b0e9](https://github.com/Cofinpro/lanecraft/commit/2a0b0e969a58a8fbd778a670f60f611377c2fc11))
* package as claude code plugin with release pipeline ([b87d13e](https://github.com/Cofinpro/lanecraft/commit/b87d13e9fe68eec8dafd46d03a13f6084a797c07))
* **skills:** add bpmn-process-design ([ee7540b](https://github.com/Cofinpro/lanecraft/commit/ee7540b2dad486067123f96bc440f2cfd8ba3daa))

### Bug Fixes

* **skills:** describe lanes as roles in bpmn-process-design ([f4119d0](https://github.com/Cofinpro/lanecraft/commit/f4119d0ac4220b91a41af9fe4b720958eb7d1fac))
