-- CreateIndex
CREATE INDEX "Todo_userId_completed_idx" ON "Todo"("userId", "completed");

-- CreateIndex
CREATE INDEX "Todo_userId_order_idx" ON "Todo"("userId", "order");

-- CreateIndex
CREATE INDEX "Todo_userId_createdAt_idx" ON "Todo"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Todo_title_idx" ON "Todo"("title");
