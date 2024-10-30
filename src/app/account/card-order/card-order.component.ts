import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';
import { CardStatus2Item, CardStatusItem, OrderedCard } from 'src/app/shared/services/sinopac/member.models';
import { AuthHelper, MemberService, ServiceHelper } from 'src/app/shared/shared.module';
declare var Sortable: any;

@Component({
    selector: 'app-card-order',
    templateUrl: './card-order.component.html',
    styleUrls: ['./card-order.component.scss']
})
export class CardOrderComponent implements OnInit, AfterViewInit {
    private readonly app = new AppWrapper();
    public cards: CardStatus2Item[];
    public sortable: any;

    public constructor(
        private router: Router,
        private memberService: MemberService,
    ) { }

    async ngOnInit(): Promise<void> {
        this.app.initHeaderBack('卡片列表');
        const response = await this.memberService.CardStatus2({ ID: AuthHelper.CustomerId,  IsIncludeDebitCard:true });
        if (ServiceHelper.ifSuccess(response)) {
            this.cards = response.Result.Items.filter(item => item.IsEmbossed)
                .sort((a, b) => a.OrderIndex - b.OrderIndex).slice(0, 20);//取已核卡的卡片20張
            console.log(this.cards);
        }

        this.app.dialogCallackEvent.subscribe(event => {
            if (event.id === 'UpdateSortSuccess' && event.action === 0) {
                this.router.navigate(['/Account/CardManage']);
            }
        });
    }

    public ngAfterViewInit() {
        var el = document.getElementById("card-list__drag");
        this.sortable = Sortable.create(el, {
            disabled: false, // 關閉Sortable
            animation: 150,  // 物件移動時間(單位:毫秒)
            handle: ".card-list__drag-btn",  // 可拖曳的區域
            draggable: ".card-list",  // 可拖曳的物件
            ghostClass: "sortable-ghost",  // 拖曳時，給予物件的類別
            chosenClass: "sortable-chosen",  // 選定時，給予物件的類別
            forceFallback: false,  // 忽略HTML5 DnD
        });

    }

    public showCard(index: CardStatusItem) {
        this.router.navigate(['/Account/CardManage'], { state: { cardNo: index.CardNo } })
    }

    public async updateSort() {
        var newCardSort: OrderedCard[] = [];
        //取卡片變動後排序
        var newSort: Array<string> = this.sortable.toArray();
        console.log('newSort = ' + newSort);
        for (let index = 0; index < newSort.length; index++) {
            // 找原本位置卡號
            var card = this.cards[newSort[index]];
            // 寫入新排序、卡號
            if (card) {
                newCardSort.push({ orderIndex: index, cardNo: card.CardNo })
            }
        }
        console.log(newCardSort);
        // update sort
        const response = await this.memberService.UpdateOrderedCardList({ ID: AuthHelper.CustomerId, cards: newCardSort });
        if (ServiceHelper.ifSuccess(response)) {
            this.app.showMsgDialog({ id: 'UpdateSortSuccess', title: '更新順序成功', msg: '更新順序成功', btnStr: '確定' });
        } else {
            //TODO Error log 寫入??
            console.log('UpdateOrderedCardList Fail,ResultCode:' + response.ResultCode + ',ResultMessage:' + response.ResultMessage);
        }
    }

    public onImgError(event) {
        event.target.src = 'mma8/card/images/card-lost/default.png';
    }
}
