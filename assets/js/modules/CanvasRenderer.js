class CanvasRenderer {
    constructor(canvasId = 'gantt-canvas') {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas element with id "${canvasId}" not found`);
        }
        this.ctx = this.canvas.getContext('2d');
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    daysBetween(a, b) {
        const ms = 24 * 60 * 60 * 1000;
        return Math.floor((b - a) / ms);
    }

    getMonthName(date) {
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return months[date.getMonth()];
    }

    renderDaily(tasks, headers = { proyecto: 'Proyecto', tarea: 'Tarea' }) {
        if (!tasks || tasks.length === 0) {
            this.clear();
            return;
        }

        const sorted = [...tasks].sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio));
        const startDate = new Date(Math.min(...sorted.map(t => new Date(t.fechaInicio))));
        const endDate = new Date(Math.max(...sorted.map(t => new Date(t.fechaFin))));
        const dayCount = this.daysBetween(startDate, endDate) + 1;

        const projectColWidth = 120;
        const taskColWidth = 180;
        const cellWidth = 24;
        const rowHeight = 28;
        const leftStart = projectColWidth + taskColWidth;

        this.canvas.width = leftStart + dayCount * cellWidth + 20;
        this.canvas.height = rowHeight * (sorted.length + 3);

        this.clear();
        const ctx = this.ctx;
        ctx.font = '12px sans-serif';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#000';

        // Column headers
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, projectColWidth, rowHeight);
        ctx.fillRect(projectColWidth, 0, taskColWidth, rowHeight);
        ctx.strokeRect(0, 0, projectColWidth, rowHeight);
        ctx.strokeRect(projectColWidth, 0, taskColWidth, rowHeight);
        ctx.fillStyle = '#000';
        ctx.fillText(headers.proyecto, 4, rowHeight / 2);
        ctx.fillText(headers.tarea, projectColWidth + 4, rowHeight / 2);

        // Months row
        ctx.fillStyle = '#e6e6e6';
        ctx.fillRect(leftStart, 0, dayCount * cellWidth, rowHeight);
        ctx.strokeRect(leftStart, 0, dayCount * cellWidth, rowHeight);

        ctx.textAlign = 'center';
        let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        while (current <= endDate) {
            const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
            const startIdx = Math.max(0, this.daysBetween(startDate, current));
            const endIdx = Math.min(dayCount - 1, this.daysBetween(startDate, monthEnd));
            const x = leftStart + startIdx * cellWidth;
            const w = (endIdx - startIdx + 1) * cellWidth;
            ctx.fillStyle = '#e6e6e6';
            ctx.fillRect(x, 0, w, rowHeight);
            ctx.strokeRect(x, 0, w, rowHeight);
            ctx.fillStyle = '#000';
            ctx.fillText(
                `${this.getMonthName(current)} ${current.getFullYear()}`,
                x + w / 2,
                rowHeight / 2
            );
            current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
        }

        // Days row
        for (let i = 0; i < dayCount; i++) {
            const x = leftStart + i * cellWidth;
            const y = rowHeight;
            ctx.fillStyle = '#fafafa';
            ctx.fillRect(x, y, cellWidth, rowHeight);
            ctx.strokeRect(x, y, cellWidth, rowHeight);
            const day = new Date(startDate.getTime() + i * 86400000).getDate();
            ctx.fillStyle = '#000';
            ctx.fillText(day.toString(), x + 4, y + rowHeight / 2);
        }

        // Task rows
        sorted.forEach((task, index) => {
            const y = rowHeight * (index + 2);
            // Project column
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, y, projectColWidth, rowHeight);
            ctx.strokeRect(0, y, projectColWidth, rowHeight);
            ctx.fillStyle = '#000';
            ctx.fillText(task.proyecto, 4, y + rowHeight / 2);

            // Task column
            ctx.fillStyle = '#fff';
            ctx.fillRect(projectColWidth, y, taskColWidth, rowHeight);
            ctx.strokeRect(projectColWidth, y, taskColWidth, rowHeight);
            ctx.fillStyle = '#000';
            ctx.fillText(task.tarea, projectColWidth + 4, y + rowHeight / 2);

            // Bar for task duration
            const startIdx = this.daysBetween(startDate, new Date(task.fechaInicio));
            const endIdx = this.daysBetween(startDate, new Date(task.fechaFin));
            const barX = leftStart + startIdx * cellWidth;
            const barWidth = (endIdx - startIdx + 1) * cellWidth;
            ctx.fillStyle = task.color || '#2196F3';
            ctx.fillRect(barX, y + 4, barWidth, rowHeight - 8);
            ctx.strokeRect(barX, y + 4, barWidth, rowHeight - 8);
        });
    }
}

export default CanvasRenderer;
