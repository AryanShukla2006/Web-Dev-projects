(function ($) {
    var methods = {
        init: function (options) {
            return this.each(function () {
                const settings = {
                    levels: [
                        { level: "Easy", numbers: 70 },
                        { level: "Medium", numbers: 30 },
                        { level: "Hard", numbers: 20 }
                    ]
                };

                const defaults = {
                    matrix: [],
                    domMatrix: [],
                    numOfRows: 9,
                    numOfCols: 9,
                    level: 40,
                    selected: null,
                    selectedSolution: null,
                    answerTracker: {
                        "1": 9, "2": 9, "3": 9, "4": 9, "5": 9,
                        "6": 9, "7": 9, "8": 9, "9": 9
                    }
                };

                if (options) $.extend(settings, options);

                const $this = $(this);
                $this.addClass("sdk-game");

                // Create matrix
                $this.createMatrix = function () {
                    const matrix = [];
                    for (let row = 0; row < 9; row++) {
                        matrix[row] = [];
                        for (let col = 0; col < 9; col++) {
                            let num = col + 1 + (row * 3) + Math.floor(row / 3) % 3;
                            if (num > 9) num %= 9;
                            if (num === 0) num = 9;
                            matrix[row][col] = num;
                        }
                    }

                    // Shuffle rows and columns
                    for (let i = 0; i < 9; i += 3) {
                        for (let j = 0; j < 3; j++) {
                            let row1 = Math.floor(Math.random() * 3) + i;
                            let row2;
                            do {
                                row2 = Math.floor(Math.random() * 3) + i;
                            } while (row1 === row2);
                            [matrix[row1], matrix[row2]] = [matrix[row2], matrix[row1]];
                        }
                    }

                    for (let i = 0; i < 9; i += 3) {
                        for (let j = 0; j < 3; j++) {
                            let col1 = Math.floor(Math.random() * 3) + i;
                            let col2;
                            do {
                                col2 = Math.floor(Math.random() * 3) + i;
                            } while (col1 === col2);
                            for (let k = 0; k < 9; k++) {
                                [matrix[k][col1], matrix[k][col2]] = [matrix[k][col2], matrix[k][col1]];
                            }
                        }
                    }

                    return matrix;
                };

                // Create Sudoku table
                $this.createTable = function () {
                    defaults.domMatrix = [];
                    defaults.table = $("<div class='sdk-table'></div>");

                    for (let row = 0; row < defaults.numOfRows; row++) {
                        defaults.domMatrix[row] = [];
                        const tempRow = $("<div class='sdk-row'></div>");
                        if (row === 2 || row === 5) tempRow.addClass("sdk-border");

                        for (let col = 0; col < defaults.numOfCols; col++) {
                            const cell = $(`<div class='sdk-col' data-row='${row}' data-col='${col}'></div>`);
                            if (col === 2 || col === 5) cell.addClass("sdk-border");
                            defaults.domMatrix[row][col] = cell;
                            tempRow.append(cell);
                        }

                        defaults.table.append(tempRow);
                    }

                    defaults.table.append("<div class='sdk-table-bk'></div>");
                    $this.append(defaults.table);

                    // Fill random cells
                    let remaining = defaults.level;
                    while (remaining > 0) {
                        let row = Math.floor(Math.random() * 9);
                        let col = Math.floor(Math.random() * 9);
                        const cell = defaults.domMatrix[row][col];
                        if (cell.children().length === 0) {
                            cell.append(`<div class='sdk-solution'>${defaults.matrix[row][col]}</div>`);
                            defaults.answerTracker[defaults.matrix[row][col]]--;
                            remaining--;
                        }
                    }

                    // Handle cell click
                    defaults.table.find(".sdk-col").click(function () {
                        $(".sdk-col").removeClass("sdk-selected");
                        $(".sdk-solution").removeClass("sdk-helper");

                        const row = $(this).data("row");
                        const col = $(this).data("col");

                        if ($(this).children().length === 0) {
                            $(this).addClass("sdk-selected");
                            defaults.selected = defaults.domMatrix[row][col];
                            defaults.selectedSolution = defaults.matrix[row][col];
                        } else {
                            $this.highlightHelp(parseInt($(this).text()));
                        }
                    });

                    $this.answerPicker();

                    setTimeout(() => {
                        defaults.table.removeClass("sdk-no-show");
                    }, 300);
                };

                // Add answer buttons
                $this.answerPicker = function () {
                    const container = $("<div class='sdk-ans-container'></div>");
                    for (let num in defaults.answerTracker) {
                        const btn = $("<div class='sdk-btn'>" + num + "</div>");
                        if (defaults.answerTracker[num] <= 0) btn.addClass("sdk-no-show");
                        container.append(btn);
                    }

                    container.find(".sdk-btn").click(function () {
                        const value = $(this).text();
                        if ($(this).hasClass("sdk-no-show")) return;
                        if (!defaults.selected || defaults.selected.children().length !== 0) return;

                        if (parseInt(value) === defaults.selectedSolution) {
                            defaults.answerTracker[value]--;
                            if (defaults.answerTracker[value] === 0) {
                                $(this).addClass("sdk-no-show");
                            }
                            $(".sdk-col").removeClass("sdk-selected");
                            defaults.selected.append(`<div class='sdk-solution'>${value}</div>`);
                        }

                        // Check for completion
                        const totalCells = $(".sdk-col").length;
                        const filledCells = $(".sdk-solution").length;
                        if (filledCells === totalCells) {
                            $("#back-btn").fadeIn(); // Show back to home button
                        }
                    });

                    $this.append(container);
                };

                // Highlight helper
                $this.highlightHelp = function (number) {
                    for (let row = 0; row < defaults.numOfRows; row++) {
                        for (let col = 0; col < defaults.numOfCols; col++) {
                            const val = parseInt(defaults.domMatrix[row][col].text());
                            if (val === number) {
                                defaults.domMatrix[row][col].find(".sdk-solution").addClass("sdk-helper");
                            }
                        }
                    }
                };

                // Level picker
                $this.createDiffPicker = function () {
                    const picker = $("<div class='sdk-picker'></div>");
                    settings.levels.forEach(lvl => {
                        const btn = $(`<div class='sdk-btn' data-level='${lvl.numbers}'>${lvl.level}</div>`);
                        picker.append(btn);
                    });

                    $this.append(picker);

                    picker.find(".sdk-btn").click(function () {
                        defaults.level = parseInt($(this).data("level"));
                        picker.fadeOut(() => {
                            picker.remove();
                            $this.createTable();
                        });
                    });

                    setTimeout(() => picker.removeClass("sdk-no-show"), 500);
                };

                defaults.matrix = $this.createMatrix();
                $this.createDiffPicker();
            });
        }
    };

    $.fn.sudoku = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === "object" || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error("Method " + method + " does not exist on jQuery.sudoku");
        }
    };
})(jQuery);
